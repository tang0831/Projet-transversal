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
