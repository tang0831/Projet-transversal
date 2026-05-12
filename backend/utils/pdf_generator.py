import os
from datetime import datetime
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas


def generate_acte_pdf(acte_data):
    """
    acte_data expected tuple:
    (id_acte, type, date_acte, numero_registre, date_registrement, id_citoyen, nom, prenom, cin)
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
    c.setFont("Helvetica-Bold", 20)
    title = f"EXTRAIT D'ACTE DE {acte_data[1].upper()}"
    c.drawCentredString(width / 2, height - 6 * cm, title)

    # Content
    c.setFont("Helvetica", 12)
    y = height - 8 * cm

    details = [
        ("Numéro de Registre :", acte_data[3]),
        ("Date de l'acte :", str(acte_data[2])),
        ("", ""),
        ("NOM :", acte_data[6] or "N/A"),
        ("Prénom(s) :", acte_data[7] or "N/A"),
        ("Numéro CIN :", acte_data[8] or "N/A"),
        ("", ""),
        ("Fait à :", "Antananarivo"),
        ("Le :", datetime.now().strftime("%d/%m/%Y")),
    ]

    for label, value in details:
        if label:
            c.setFont("Helvetica-Bold", 12)
            c.drawString(3 * cm, y, label)
            c.setFont("Helvetica", 12)
            c.drawString(8 * cm, y, str(value))
        y -= 0.8 * cm

    # Footer/Stamp area
    c.setFont("Helvetica-Oblique", 10)
    c.drawRightString(width - 3 * cm, 4 * cm, "L'Officier d'État Civil,")

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
