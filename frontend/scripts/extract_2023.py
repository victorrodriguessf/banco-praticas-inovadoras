"""
Extração OCR do catálogo 2023 do PDF praticas-inovadoras-2023.pdf
Gera src/data/catalogo_2023.json no mesmo formato de 2024/2025.

Layout do PDF 2023 (scanned, 2 colunas):
  COLUNA ESQUERDA (0-50%): título, CEP, Instrutor, Segmento, Elementos, Situação
  COLUNA DIREITA  (50-100%): Marcas Formativas (checkboxes), Aprendizagem integradora

  Valores após labels no OCR: "CEP: | Alecrim" → valor = "Alecrim"
  Checkboxes de marcas não são detectáveis por OCR → marcas_formativas = []
"""

import re
import json
import sys
from pathlib import Path

from pdf2image import convert_from_path
import pytesseract

PDF_PATH = Path(__file__).parent.parent / 'public/pdfs/praticas-inovadoras-2023.pdf'
OUTPUT_PATH = Path(__file__).parent.parent / 'src/data/catalogo_2023.json'

# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def clean_ws(text: str) -> str:
    return re.sub(r'\s+', ' ', text).strip()


def is_practice_page(left_text: str) -> bool:
    """A practice page has CEP and Situação de aprendizagem in the left column."""
    has_cep = bool(re.search(r'\bCEP\b', left_text, re.IGNORECASE))
    has_sit = bool(re.search(r'Situa[çc][aã]o', left_text, re.IGNORECASE))
    return has_cep and has_sit


def extract_title(lines: list[str]) -> str:
    """First non-empty line, remove trailing page number, fix common OCR errors."""
    if not lines:
        return ''
    title = lines[0]
    # Remove trailing page number
    title = re.sub(r'\s+\d{1,3}\s*$', '', title).strip()
    # Fix "ll" at start → "Il" (OCR reads capital I as two lowercase l's)
    title = re.sub(r'^ll', 'Il', title)
    # Capitalize first letter if still lowercase
    if title and title[0].islower():
        title = title[0].upper() + title[1:]
    return title


def _strip_pipe(val: str) -> str:
    """Strip the leading '| ' separator that appears in form values."""
    return re.sub(r'^\|?\s*', '', val).strip()


def extract_after_label(text: str, pattern: str) -> str:
    """Extract value after a label. Handles '| value' pattern."""
    m = re.search(pattern, text, re.IGNORECASE)
    if not m:
        return ''
    after = text[m.end():]
    line_end = after.find('\n')
    raw = after[:line_end].strip() if line_end >= 0 else after.strip()
    value = _strip_pipe(raw)
    # If looks like another label, discard
    if re.match(r'(Instrutor|Segmento|Elementos|CEP|Marcas|Situa)', value, re.IGNORECASE):
        return ''
    # Remove trailing OCR noise: isolated single chars or pipe fragments
    value = re.sub(r'\s+[xX|]\s+[a-z]{1,2}$', '', value).strip()
    value = re.sub(r'\s+[xX|]$', '', value).strip()
    return clean_ws(value)


def extract_section(text: str, start_pattern: str, end_pattern=None) -> str:
    """Extract text block between two patterns."""
    m_start = re.search(start_pattern, text, re.IGNORECASE)
    if not m_start:
        return ''
    content = text[m_start.end():]
    if end_pattern:
        m_end = re.search(end_pattern, content, re.IGNORECASE)
        if m_end:
            content = content[:m_end.start()]
    return clean_ws(content)


# ------------------------------------------------------------------
# Per-page processing
# ------------------------------------------------------------------

def process_page(img, page_num: int):
    w, h = img.size
    split_x = int(w * 0.50)

    left_img = img.crop((0, 0, split_x, h))

    cfg = '--psm 6'
    left_text = pytesseract.image_to_string(left_img, lang='por', config=cfg)

    if not is_practice_page(left_text):
        return None

    left_lines = [l.strip() for l in left_text.splitlines() if l.strip()]

    title = extract_title(left_lines)

    # CEP / unit: "CEP: | Alecrim"
    cep = extract_after_label(left_text, r'CEP\s*[:\.]')

    # Instrutor
    instrutor = extract_after_label(left_text, r'Instrutor[:\.]?\s*')

    # Segmento e curso — OCR has various errors: "CUISO", "CUFSO", "CUrSO"
    segmento = extract_after_label(
        left_text,
        r'Seg[^\n]{0,20}[Cc][Uu][a-zA-Z][Ss][Oo]\s*[:\.]'
    )
    if not segmento:
        segmento = extract_after_label(left_text, r'Segmento[^\n]*?[:\.]')

    # Elementos de competência
    elementos = extract_section(
        left_text,
        r'Elementos?\s*de\s*competência\s*[:\.]?',
        r'Situa[çc][aã]o\s*de\s*aprendizagem'
    )

    # Situação de aprendizagem
    situacao = extract_section(
        left_text,
        r'Situa[çc][aã]o\s*de\s*aprendizagem\s*[:\.]?'
    )

    # Clean up line breaks in long text fields
    elementos = re.sub(r'\s*-\s*\n\s*', '', elementos)
    situacao = re.sub(r'\s*-\s*\n\s*', '', situacao)

    return {
        'pagina': page_num,
        'nome_projeto': title,
        'cep': cep,
        'instrutor': instrutor,
        'segmento_curso': segmento,
        'elementos_competencia': elementos,
        'situacao_aprendizagem': situacao,
    }


# ------------------------------------------------------------------
# Main
# ------------------------------------------------------------------

def main():
    print(f'Carregando PDF: {PDF_PATH}')
    images = convert_from_path(str(PDF_PATH), dpi=300)
    total = len(images)
    print(f'Total de páginas: {total}')

    raw = []
    for i, img in enumerate(images):
        page_num = i + 1
        sys.stdout.write(f'\rProcessando {page_num}/{total}...')
        sys.stdout.flush()
        result = process_page(img, page_num)
        if result:
            raw.append(result)

    print(f'\nPráticas encontradas: {len(raw)}')

    projetos = []
    for idx, p in enumerate(raw):
        pid = f'P{idx + 1:03d}'
        projetos.append({
            'id_projeto': pid,
            'pagina_inicial': p['pagina'],
            'pagina_situacao': p['pagina'],
            'nome_projeto': p['nome_projeto'],
            'cep': p['cep'],
            'instrutor': p['instrutor'],
            'orientacao_pedagogica': 'Não informado',
            'segmento_curso': p['segmento_curso'],
            'elementos_competencia': p['elementos_competencia'],
            'marcas_formativas': [],
            'aprendizagem_integradora': {'valor': False},
            'pratica_inclusiva': {'valor': False},
            'pratica_fomento_inclusao': {'valor': False},
            'ods': [],
            'situacao_aprendizagem': p['situacao_aprendizagem'],
            'tags_identificacao': [pid],
        })

    catalog = {
        'fonte': 'Ebook_Educação_Inovadora_Melhores_Praticas_2023.pdf',
        'total_projetos': len(projetos),
        'projetos': projetos,
    }

    OUTPUT_PATH.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Salvo em: {OUTPUT_PATH}')

    print('\n--- Amostra (primeiras 5) ---')
    for p in projetos[:5]:
        print(f"  [{p['id_projeto']}] pg={p['pagina_inicial']} | {p['nome_projeto']}")
        print(f"       CEP: {p['cep'] or '(vazio)'} | Instrutor: {p['instrutor'] or '(vazio)'}")
        print(f"       Segmento: {p['segmento_curso'] or '(vazio)'}")
        sit = p['situacao_aprendizagem']
        print(f"       Situação ({len(sit)}ch): {sit[:80]}...")
        print()


if __name__ == '__main__':
    main()
