import os
from datetime import datetime
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas


def generate_acte_pdf(data):
    """
    Générateur universel d'actes d'état civil pour Madagascar.
    Filtre et affiche dynamiquement les données selon le type d'acte :
    'NAISSANCE', 'MARIAGE' ou 'DÉCÈS'.
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # --- 1. CADRE OFFICIEL ET BORDURES ---
    c.setStrokeColor(colors.black)
    c.setLineWidth(1)
    c.rect(1.5 * cm, 1.5 * cm, width - 3 * cm, height - 3 * cm)
    c.rect(
        1.7 * cm, 1.7 * cm, width - 3.4 * cm, height - 3.4 * cm
    )  # Double cadre de sécurité

    # --- 2. EN-TÊTE DE LA RÉPUBLIQUE ---
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(width / 2, height - 2.5 * cm, "REPOBLIKAN'I MADAGASIKARA")
    c.setFont("Helvetica-Oblique", 10)
    c.drawCentredString(
        width / 2, height - 3.0 * cm, "Fitiavana – Tanindrazana – Fandrosoana"
    )

    # --- 3. BLOC ADMINISTRATIF DE LA LOCALITÉ (Gauche) ---
    c.setFont("Helvetica-Bold", 9)
    y_admin = height - 4.2 * cm
    c.drawString(
        2.5 * cm, y_admin, f"FARITANY : {data.get('faritany', 'TOAMASINA').upper()}"
    )
    c.drawString(
        2.5 * cm,
        y_admin - 0.4 * cm,
        f"FARITRA : {data.get('faritra', 'ATSINANANA').upper()}",
    )
    c.drawString(
        2.5 * cm,
        y_admin - 0.8 * cm,
        f"DISTRIKA : {data.get('distrika', 'MAHANORO').upper()}",
    )
    c.drawString(
        2.5 * cm,
        y_admin - 1.2 * cm,
        f"KAOMININA : {data.get('kaominina', 'MAHANORO').upper()}",
    )

    # --- 4. NUMÉRO D'ENREGISTREMENT ET REGISTRE (Droite) ---
    type_acte = data.get("type_acte", "NAISSANCE").upper()
    c.drawRightString(
        width - 2.5 * cm,
        y_admin,
        f"Laharana (No): {data.get('numero_registre', 'N/A')}",
    )
    c.drawRightString(
        width - 2.5 * cm,
        y_admin - 0.4 * cm,
        f"Taona (Année): {data.get('annee_registre', 'N/A')}",
    )

    # --- 5. TITRE DU DOCUMENT ---
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width / 2, height - 6.5 * cm, '"KOPIAN\'NY SORA-PIANKOHONANA"')
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(
        width / 2, height - 7.1 * cm, f"(Acte de {type_acte.capitalize()})"
    )

    # --- 6. TEXTE INTRODUCTIF COMMUN ---
    c.setFont("Helvetica", 11)
    intro = f"Nalaina tamin'ny bokim-piankohonana eto {data.get('kaominina', 'Mahanoro')}, izao soratra manaraka izao :"
    c.drawString(2.5 * cm, height - 8.5 * cm, intro)

    # --- 7. RESTRUCTURATION DYNAMIQUE DES DONNÉES SELON L'ACTE ---
    c.setFont("Helvetica", 11)
    y_content = height - 10.0 * cm

    # ==========================================
    # CAS A : ACTE DE NAISSANCE
    # ==========================================
    if type_acte == "NAISSANCE":
        # Date, Heure et Lieu de naissance de l'enfant
        txt_naissance = f"Tamin'ny faha-{data.get('date_naissance', '...')} tamin'ny {data.get('heure_naissance', '...')}, no teraka tao {data.get('lieu_naissance', '...')}:"
        c.drawString(2.5 * cm, y_content, txt_naissance)

        # Identité complète de l'enfant
        y_content -= 0.8 * cm
        c.setFont("Helvetica-Bold", 12)
        c.drawString(
            2.5 * cm,
            y_content,
            f"Ny zaza : {data.get('prenom_enfant', '')} {data.get('nom_enfant', '').upper()}",
        )
        c.setFont("Helvetica", 11)
        c.drawRightString(
            width - 2.5 * cm, y_content, f"Sexe : {data.get('sexe_enfant', '...')}"
        )

        # Séparateur de section
        y_content -= 0.5 * cm
        c.setLineWidth(0.5)
        c.line(2.5 * cm, y_content, width - 2.5 * cm, y_content)

        # Identité et statut social des Parents
        y_content -= 0.6 * cm
        c.drawString(
            2.5 * cm,
            y_content,
            f"Zanak'i (Fils de) : {data.get('prenom_pere', '')} {data.get('nom_pere', '').upper()}",
        )
        y_content -= 0.5 * cm
        c.drawString(
            3.0 * cm,
            y_content,
            f"Taona : {data.get('age_pere', '...')} taona, Asa (Profession) : {data.get('profession_pere', '...')}",
        )

        y_content -= 0.7 * cm
        c.drawString(
            2.5 * cm,
            y_content,
            f"Ary an'i (Et de) : {data.get('prenom_mere', '')} {data.get('nom_mere', '').upper()}",
        )
        y_content -= 0.5 * cm
        c.drawString(
            3.0 * cm,
            y_content,
            f"Taona : {data.get('age_mere', '...')} taona, Asa (Profession) : {data.get('profession_mere', '...')}",
        )

        y_content -= 0.7 * cm
        c.drawString(
            2.5 * cm,
            y_content,
            f"Monina sy mipetraka ao (Domicile des parents) : {data.get('domicile_parents', '...')}",
        )

    # ==========================================
    # CAS B : ACTE DE MARIAGE
    # ==========================================
    elif type_acte == "MARIAGE":
        # Date et Lieu de célébration du mariage
        txt_mariage = f"Tamin'ny faha-{data.get('date_mariage', '...')} tamin'ny {data.get('heure_mariage', '...')}, no nampidirina ho mpivady ara-dalàna tao {data.get('lieu_mariage', '...')} :"
        c.drawString(2.5 * cm, y_content, txt_mariage)

        # Section Époux (Lahy)
        y_content -= 1.0 * cm
        c.setFont("Helvetica-Bold", 11)
        c.drawString(2.5 * cm, y_content, f"NY VADINY LAHY (L'ÉPOUX) :")
        c.setFont("Helvetica", 11)
        y_content -= 0.5 * cm
        c.drawString(
            3.0 * cm,
            y_content,
            f"Anarana : {data.get('prenom_epoux', '')} {data.get('nom_epoux', '').upper()}",
        )
        y_content -= 0.5 * cm
        c.drawString(
            3.0 * cm,
            y_content,
            f"Teraka ny : {data.get('date_nais_epoux', '...')} tao : {data.get('lieu_nais_epoux', '...')}",
        )
        y_content -= 0.5 * cm
        c.drawString(
            3.0 * cm,
            y_content,
            f"Zanak'i : {data.get('pere_epoux', '...')} sy {data.get('mere_epoux', '...')}",
        )

        # Section Épouse (Vavy)
        y_content -= 0.8 * cm
        c.setFont("Helvetica-Bold", 11)
        c.drawString(2.5 * cm, y_content, f"NY VADINY VAVY (L'ÉPOUSE) :")
        c.setFont("Helvetica", 11)
        y_content -= 0.5 * cm
        c.drawString(
            3.0 * cm,
            y_content,
            f"Anarana : {data.get('prenom_epouse', '')} {data.get('nom_epouse', '').upper()}",
        )
        y_content -= 0.5 * cm
        c.drawString(
            3.0 * cm,
            y_content,
            f"Teraka ny : {data.get('date_nais_epouse', '...')} tao : {data.get('lieu_nais_epouse', '...')}",
        )
        y_content -= 0.5 * cm
        c.drawString(
            3.0 * cm,
            y_content,
            f"Zanak'i : {data.get('pere_epouse', '...')} sy {data.get('mere_epouse', '...')}",
        )

    # ==========================================
    # CAS C : ACTE DE DÉCÈS
    # ==========================================
    elif type_acte == "DÉCÈS" or type_acte == "DECES":
        # Date, Heure et Lieu du décès
        txt_deces = f"Tamin'ny faha-{data.get('date_deces', '...')} tamin'ny {data.get('heure_deces', '...')}, no nodimandry tao {data.get('lieu_deces', '...')} :"
        c.drawString(2.5 * cm, y_content, txt_deces)

        # Identité complète du défunt
        y_content -= 1.0 * cm
        c.setFont("Helvetica-Bold", 12)
        c.drawString(
            2.5 * cm,
            y_content,
            f"Ilay nodimandry (Le défunt) : {data.get('prenom_defunt', '')} {data.get('nom_defunt', '').upper()}",
        )

        # Informations complémentaires sur le défunt
        c.setFont("Helvetica", 11)
        y_content -= 0.6 * cm
        c.drawString(
            2.5 * cm,
            y_content,
            f"Asa fivelomana (Profession) : {data.get('profession_defunt', '...')}",
        )
        y_content -= 0.6 * cm
        c.drawString(
            2.5 * cm, y_content, f"Taona (Âge) : {data.get('age_defunt', '...')} taona"
        )
        y_content -= 0.6 * cm
        c.drawString(
            2.5 * cm,
            y_content,
            f"Teraka tao : {data.get('lieu_naissance_defunt', '...')}",
        )

        # Filiation du défunt
        y_content -= 0.8 * cm
        c.drawString(
            2.5 * cm,
            y_content,
            f"Zanak'i (Fils/Fille de) : {data.get('pere_defunt', '...')} sy de {data.get('mere_defunt', '...')}",
        )
        y_content -= 0.6 * cm
        c.drawString(
            2.5 * cm,
            y_content,
            f"Toe-pianakaviana (Situation) : {data.get('situation_matrimoniale', '...')}",
        )

    # --- 8. PIED DE PAGE ET TRACABILITÉ DU DEMANDEUR ---
    y_content = 5.5 * cm
    c.setLineWidth(0.5)
    c.line(2.5 * cm, y_content, width - 2.5 * cm, y_content)

    y_content -= 0.5 * cm
    c.setFont("Helvetica-Oblique", 10)
    c.drawString(
        2.5 * cm,
        y_content,
        f"Kopia navoaka araka ny fangatahan'i : {data.get('nom_demandeur', 'Ilay voakasika')}",
    )

    # --- 9. SIGNATURE DE L'OFFICIER ---
    y_content -= 1.2 * cm
    c.setFont("Helvetica", 11)
    c.drawString(
        2.5 * cm,
        y_content,
        f"Nomena teto {data.get('kaominina', 'Mahanoro')}, ny {data.get('date_livraison', '...')}",
    )

    c.setFont("Helvetica-Bold", 11)
    c.drawRightString(
        width - 2.5 * cm, y_content - 0.5 * cm, "Ny Mpiandraikitra ny Sora-piankohonana"
    )
    c.setFont("Helvetica-Oblique", 9)
    c.drawRightString(
        width - 2.5 * cm, y_content - 0.9 * cm, "(Officier de l'État Civil)"
    )

    c.showPage()
    c.save()
    pdf_out = buffer.getvalue()
    buffer.close()
    return pdf_out

def generate_citoyens_pdf(citoyens_list):
    """
    citoyens_list expected: list of dicts with nom, prenom, numero_cin
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Border
    c.setStrokeColor(colors.black)
    c.rect(1 * cm, 1 * cm, width - 2 * cm, height - 2 * cm)

    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2, height - 3 * cm, "RÉPUBLIQUE DE MADAGASCAR")
    c.setFont("Helvetica", 12)
    c.drawCentredString(
        width / 2, height - 3.7 * cm, "Fitiavana - Tanindrazana - Fandrosoana"
    )

    c.line(5 * cm, height - 4.2 * cm, width - 5 * cm, height - 4.2 * cm)

    # Title
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2, height - 6 * cm, "LISTE DES CITOYENS")

    # Table Header
    c.setFont("Helvetica-Bold", 10)
    y = height - 8 * cm
    c.drawString(2 * cm, y, "NOM")
    c.drawString(8 * cm, y, "PRÉNOM(S)")
    c.drawString(14 * cm, y, "CIN")
    c.line(2 * cm, y - 0.2 * cm, width - 2 * cm, y - 0.2 * cm)

    # Table Content
    c.setFont("Helvetica", 10)
    y -= 0.8 * cm
    for citoyen in citoyens_list:
        if y < 3 * cm: # Simple pagination check
            c.showPage()
            y = height - 3 * cm
            c.setFont("Helvetica", 10)

        c.drawString(2 * cm, y, str(citoyen.get('nom', 'N/A')))
        c.drawString(8 * cm, y, str(citoyen.get('prenom', 'N/A')))
        c.drawString(14 * cm, y, str(citoyen.get('numero_cin', 'N/A')))
        y -= 0.6 * cm

    c.showPage()
    c.save()

    pdf_out = buffer.getvalue()
    buffer.close()
    return pdf_out

def generate_actes_pdf(actes_list):
    """
    actes_list expected: list of dicts with type_acte, date_acte, numero_registre
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Border
    c.setStrokeColor(colors.black)
    c.rect(1 * cm, 1 * cm, width - 2 * cm, height - 2 * cm)

    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2, height - 3 * cm, "RÉPUBLIQUE DE MADAGASCAR")
    c.setFont("Helvetica", 12)
    c.drawCentredString(
        width / 2, height - 3.7 * cm, "Fitiavana - Tanindrazana - Fandrosoana"
    )

    c.line(5 * cm, height - 4.2 * cm, width - 5 * cm, height - 4.2 * cm)

    # Title
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2, height - 6 * cm, "LISTE DES ACTES D'ÉTAT CIVIL")

    # Table Header
    c.setFont("Helvetica-Bold", 10)
    y = height - 8 * cm
    c.drawString(2 * cm, y, "TYPE")
    c.drawString(7 * cm, y, "DATE")
    c.drawString(12 * cm, y, "REGISTRE")
    c.line(2 * cm, y - 0.2 * cm, width - 2 * cm, y - 0.2 * cm)

    # Table Content
    c.setFont("Helvetica", 10)
    y -= 0.8 * cm
    for acte in actes_list:
        if y < 3 * cm:
            c.showPage()
            y = height - 3 * cm
            c.setFont("Helvetica", 10)

        c.drawString(2 * cm, y, str(acte.get('type_acte', 'N/A')))
        c.drawString(7 * cm, y, str(acte.get('date_acte', 'N/A')))
        c.drawString(12 * cm, y, str(acte.get('numero_registre', 'N/A')))
        y -= 0.6 * cm

    c.showPage()
    c.save()

    pdf_out = buffer.getvalue()
    buffer.close()
    return pdf_out
