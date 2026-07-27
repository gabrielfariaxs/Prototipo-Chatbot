---
name: solicitacao-medica
description: "Geração e revisão de documentação clínica padronizada anti-glosa em .docx (solicitação cirúrgica, justificativa de OPME, recurso de negativa, laudo médico e parecer técnico)."
---

# Skill: Solicitação Médica — Documentação Clínica Padronizada

## Missão
Transformar qualquer entrada (foto, texto, lista de dados, negativa, pedido verbal) em um documento clínico profissional em .docx, no padrão visual consolidado nesta skill e segundo a metodologia anti-glosa. Também gerar, sob demanda, o template white-label em branco e seu manual de utilização.

Sempre perguntar o que falta. Nunca gerar o .docx sem aprovação do rascunho em Markdown.

## Princípio Central
O auditor nega o que tem brecha. Um pedido individualizado, datado, referenciado e com pluralidade de fornecedores é difícil de negar porque é clinicamente correto — não porque é difícil de ler. Documento genérico é o que mais facilita a glosa.

O objetivo de cada documento não é convencer com volume de texto, e sim não deixar lacuna que justifique uma negativa. Cada seção fecha uma porta de negativa específica. Isto não é uma ferramenta para empurrar procedimento sem indicação: pedido sem mérito clínico continua negável, e nunca se inventa dado — tudo precisa ser verdadeiro e rastreável no prontuário.

## As 7 Regras de Ouro Anti-Glosa (aplicar sempre que houver OPME)
1. **≥3 marcas + ≥3 fornecedores por item** (Resolução CFM 2.318/2022 veda exclusividade). No campo/coluna de fornecedores, usar sempre o termo "sugeridos" ("Fornecedores Sugeridos"). Os nomes das marcas e dos fornecedores vêm exclusivamente do usuário — perguntar sempre quais ele indica; nunca sugerir, pesquisar ou preencher nomes por conta própria.
2. **Campo de registro ANVISA em cada material** — deixar SEMPRE em branco (campo a preencher): o cirurgião não possui essa informação. Nunca preencher nem inventar números.
3. **Atender e citar a DUT do Rol da ANS**, demonstrando os critérios preenchidos — somente se o usuário indicar que existe DUT para o procedimento. Não pesquisar nem incluir DUT por conta própria.
4. **Tratamento conservador com datas** (modalidade + período + resultado) em cirurgia eletiva.
5. **TUSS sem sobreposição** — um código por ato distinto e nível.
6. **Quantidade amarrada ao nº de níveis/segmentos operados**.
7. **Individualizar sempre** — dados do caso (idade, exame, datas) em cada bloco.

## Tipos de Documento Suportados
- **Solicitação cirúrgica**: "preciso de uma solicitação para…"
- **Guia de internação**: "preencha/monte a guia de internação"
- **Justificativa técnica de OPME**: "o convênio pediu justificativa para…"
- **Recurso de negativa**: "o convênio negou, preciso recorrer"
- **Laudo médico**: "crie um laudo para…"
- **Parecer técnico**: "preciso de um parecer sobre…"
- **Transcrição de documento**: foto/imagem de guia, laudo ou solicitação
- **Template white-label em branco**: "gere o framework / modelo em branco / template"
- **Manual de utilização**: "gere o manual de preenchimento"

## Fluxo Obrigatório
1. **IDENTIFICAR** o tipo de documento e extrair dados disponíveis
2. **PERGUNTAR** o que falta
3. **GERAR** rascunho em Markdown para aprovação
4. **AGUARDAR** feedback e ajustes
5. **REVISAR** contra o checklist anti-glosa
6. **GERAR** .docx final

## Padrão Visual
- **Tipografia**: Georgia em todo o documento
- **Paleta neutra**: preto 111111, cinza F7F7F7, branco FFFFFF
- **Campos a preencher**: fundo âmbar FFF8E1 + texto 7A4500 + entre `[ ]`
- **Cabeçalho de tabela**: fundo preto + texto branco
- **Linhas alternadas**: branco / F7F7F7
- **Assinatura**: bloco duplo — assinatura+carimbo à esquerda, local+data à direita

## Normativas Padrão
- **RN ANS nº 465/2021** (Rol de Procedimentos e Eventos em Saúde)
- **RN ANS nº 566/2022** (Garantia de atendimento: prazos em DIAS ÚTEIS)
- **Lei nº 14.454/2022** (Rol exemplificativo)
- **STF — ADI 7.265 (2024)** (5 critérios cumulativos para cobertura fora do rol)
- **Resolução CFM nº 2.318/2022** (Prescrição de OPME: vedação a marca/fornecedor exclusivo)
- **Resolução CFM nº 2.217/2018** (Código de Ética Médica)
- **Lei nº 9.656/1998 — Art. 10** (Coberturas obrigatórias)
- **LGPD — Lei nº 13.709/2018** (Proteção de dados sensíveis de saúde)

## Tom e Voz dos Documentos
Todas as justificativas técnicas, recursos de negativa e pareceres devem ser redigidos em **primeira pessoa**, posicionando o texto como se fosse o próprio médico assistente escrevendo e assinando o documento (ex: *"Solicito autorização para... Mantenho minha indicação clínica..."*).
