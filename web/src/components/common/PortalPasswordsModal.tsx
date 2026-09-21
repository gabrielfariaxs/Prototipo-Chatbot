import React, { useState, useEffect } from 'react'
import {
  KeyRound,
  X,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Lock,
  User,
  Info,
  ShieldCheck,
  AlertTriangle,
  Building2
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

export interface PortalCredential {
  id: string
  portal_name: string
  login: string
  password?: string
  access_url?: string
  observations?: string
  company?: 'Medic' | 'Arthromed' | 'Ambas'
  created_at?: string
  updated_at?: string
}

const DEFAULT_PORTALS: PortalCredential[] = [
  // --- MEDIC PORTALS (43 ITENS) ---
  {
    id: 'p-1',
    portal_name: 'OPME NEXO (Karen)',
    login: 'karen.maia@medicpe.com.br',
    password: '190624@Lucas',
    access_url: 'https://opmenexo.bionexo.com/UserLandpage.do',
    observations: 'OPMENexo - Painel de Vendas',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-2',
    portal_name: 'OPME NEXO (Maria)',
    login: 'maria.silva@medicpe.com.br',
    password: '32212510@Medic',
    access_url: 'https://opmenexo.bionexo.com/UserLandpage.do',
    observations: 'CPF de Maria - 58313184434 / RG 3349800',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-3',
    portal_name: 'OPMENEXO / BIONEXO BELEM',
    login: 'orcamento@medicpe.com.br',
    password: '041825@Karen',
    access_url: 'https://opmenexo.bionexo.com/frons/supplier',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-4',
    portal_name: 'BIONEXO',
    login: 'orcamento@medicpe.com.br',
    password: '040693@Maia',
    access_url: 'https://bionexo.com',
    observations: 'Senha alternativa: 32212510@Medic',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-5',
    portal_name: 'GEAP RECIFE',
    login: '15037703',
    password: '13245789',
    access_url: 'https://www.geap.org.br/#',
    observations: 'Código Prestador GEAP. CPF de Maria - 58313184434 / RG 3349800',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-6',
    portal_name: 'GEAP PB',
    login: '13027107',
    password: '13245789',
    access_url: 'https://www.geap.org.br/#',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-7',
    portal_name: 'GEAP NATAL',
    login: '18022090',
    password: 'Medic@2026',
    access_url: 'https://www.geap.org.br/#',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-8',
    portal_name: 'INPART',
    login: 'karen.maia',
    password: 'Medic@123',
    access_url: 'https://www.inpartsaude.com.br/',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-9',
    portal_name: 'ASSEFAZ / POSTAL - PORTAL UNIDAS',
    login: 'medic.pe',
    password: '53-8s6H1',
    access_url: 'https://www.portalunidassaude.com.br/fornecedor/caixapostal.xhtml??at=1695840618538',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-10',
    portal_name: 'UNIMED NATAL',
    login: '05975147000110',
    password: '@Copa2026',
    access_url: 'https://portal.unimednatal.com.br/PlanodeSaude/',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-11',
    portal_name: 'UNIMED BELÉM',
    login: 'P71000090',
    password: 'Medic#2026',
    access_url: 'https://sgucard.unimedbelem.com.br/cmagnet/Login.do',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-12',
    portal_name: 'UNIMED BELÉM - NOVO PORTAL - NETSUITE',
    login: 'P71000090',
    password: 'Medic#2026',
    access_url: 'https://9540756.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=619&deploy=1&compid=9540756&ns-at=AAEJZtMQYoTyhZKevt1W0mrYSdesdGpbtzdckjoNpiatY7sMdl',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-13',
    portal_name: 'UNIMED BELÉM - NOVO PORTAL DO FORNECEDOR',
    login: 'P71000090',
    password: 'Medic@2026',
    access_url: 'https://servicedesk.unimedbelem.com.br',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-14',
    portal_name: 'UNIMED CAMPINAS',
    login: 'CPF DE KAREN - 10050204424',
    password: 'Medic@2026',
    access_url: 'https://ww2.unimedcampinas.com.br/ConnectMVC/Login/GetAccess?pSist=OPME&returnUrl=%2FOpmeMVC%2F',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-15',
    portal_name: 'POSTAL SAUDE - REDEOPME',
    login: 'karen.maia@medicpe.com.br',
    password: 'Medic#2024',
    access_url: 'https://www.redeopme.com.br',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-16',
    portal_name: 'POSTAL SAUDE - BENNER Conecta',
    login: 'orcamento@medicpe.com.br',
    password: 'Medic@2022',
    access_url: 'https://portalconectasaude.com.br/Dashboard/IndexPrestador',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-17',
    portal_name: 'CASSI',
    login: '05975147000110',
    password: '32212510@Medic',
    access_url: 'https://servicosonline.cassi.com.br/RCM',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-18',
    portal_name: 'UNIMED NACIONAL - EMS GESTAO',
    login: 'medicortopedia',
    password: 'Medic#2023',
    access_url: 'https://centralnacional.opmes.com.br/gestao/www/login.php',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-19',
    portal_name: 'EMS VENTURA',
    login: 'medic3',
    password: 'Medic2024 / Nova senha Medic1010',
    access_url: 'https://emsportal.com.br/portal/www/',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-20',
    portal_name: 'E-MAIL EMPRESA',
    login: 'orcamento@medicpe.com.br',
    password: 'Medic@#2024OR',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-21',
    portal_name: 'UNIMED JOAO PESSOA',
    login: '05975147000110',
    password: '991225783',
    access_url: 'https://www.unimedjp.com.br/fornecedores/login',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-22',
    portal_name: 'UNIMED JOAO PESSOA (EMS VENTURA)',
    login: 'medicortopedia',
    password: '2n54m8',
    access_url: 'https://unimedjp.opmes.com.br/gestao/www/login.php?erro=0&uri_redirect=',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-23',
    portal_name: 'UNIMED FORTALEZA',
    login: 'MEDICORTOPEDIA',
    password: '0406',
    access_url: 'https://www.unimedfortaleza.com.br/fornecedores',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-24',
    portal_name: 'HUMANA SAUDE',
    login: '05.975.147/0001-10',
    password: 'Medic@2026',
    access_url: 'https://solus.humanasaude.com.br/fornecedor/index.php',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-25',
    portal_name: 'ORIZON',
    login: 'F18963',
    password: 'MED731828',
    access_url: 'https://opme.orizon.com.br/TSNMVC/Account/Login',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-26',
    portal_name: 'ORIZON / FATURE',
    login: '188171',
    password: 'Medic1010@',
    access_url: 'https://www.orizon.com.br/',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-27',
    portal_name: 'LIDER SAUDE AMBIENTAL',
    login: 'SEMPRE O QUE TIVER LA',
    password: '74MCQSVQYJ11131',
    access_url: 'https://www.pestsysspider.com.br/Views/BR/AreaCliente/Login/Login.aspx?!=NE7KYOZ3N3226',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-28',
    portal_name: 'CASA DAS COPIAS',
    login: 'orcamento@medicpe.com.br',
    password: '0597',
    access_url: 'https://www.casacopias.com.br/',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-29',
    portal_name: 'BRADESCO FORNECEDOR',
    login: '05975147000110 / 10050204424',
    password: 'Gr1_Y@c8 /// Med@473809',
    access_url: 'https://www.bradescoseguros.com.br/clientes',
    observations: 'Código Prestador Bradesco: 82384',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-30',
    portal_name: 'GAMA SAUDE',
    login: '94000385',
    password: 'Medic@2025',
    access_url: 'https://gama.topsaudehub.com.br/PortalCredenciado/corretor/Account/LoginCredenciado',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-31',
    portal_name: 'PORTAL STELLANTIS',
    login: 'MEDICORTO',
    password: 'ABC12345',
    access_url: 'http://portal-ne.stellantissaude.com.br/W_PWSX010.APW',
    observations: 'Código Prestador Bradesco / Stellantis: 82384',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-32',
    portal_name: 'SULAMERICA',
    login: 'master',
    password: '123456',
    access_url: 'https://saude.sulamericaseguros.com.br/prestador/servicos-medicos/demonstrativos-tiss-3/',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-33',
    portal_name: 'SULAMERICA NOVO',
    login: 'orcamento@medicpe.com.br.enviodoc',
    password: 'Medicortopedia@25',
    access_url: 'https://sulamerica.my.site.com/EnvioDocumentos/apex/LoginEnvioDocumentos',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-34',
    portal_name: 'OPME da Unimed FESP',
    login: 'medicortopedia',
    password: 'Medic@#2024OR',
    access_url: 'https://unimedfesp.opmes.com.br/gestao/www/login.php?syscfg=producao',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-35',
    portal_name: 'GTPLAN',
    login: 'orcamento@medicpe.com.br',
    password: '042418@Medic',
    access_url: 'https://gtplan.net',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-36',
    portal_name: 'CURSOS bionexo',
    login: 'MEDIC ORTOPEDIA',
    password: 'Medic@2025',
    access_url: 'http://bionexo.konviva.com.br/',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-37',
    portal_name: 'PLATAFORMA ADVICEPLACE',
    login: 'orcamento@medicpe.com.br',
    password: 'aa5&Br8x',
    access_url: 'https://app.advicehealth.com.br/products-advice',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-38',
    portal_name: 'ARIBA AMIL - MEDIC PA',
    login: 'natalia.pereira@medicpe.com.br',
    password: 'Medic@NA26',
    access_url: 'HTTPS://SERVICE.ARIBA.COM/SOURCING.AW/124991004/AW?AWH=R&AWSSK=KWT2K05V&DARD=1',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-39',
    portal_name: 'SYSWEB',
    login: 'ORCAMENTOPE',
    password: 'medic123',
    access_url: 'https://sysweb.emultec.com.br/inside/index.php',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-40',
    portal_name: 'SURGIFLOW MEDIC',
    login: 'orcamento@medicpe.com.br',
    password: 'Mudar@123',
    access_url: 'https://app.surgiflow360.com.br/cirurgias',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-41',
    portal_name: 'Verisure',
    login: 'MEDIC',
    password: '',
    observations: 'Sem senha cadastrada (Acesso Direto)',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-42',
    portal_name: 'Email GMAIL',
    login: 'medic.nuvem@gmail.com',
    password: '',
    observations: 'Sem senha cadastrada',
    company: 'Medic',
    created_at: new Date().toISOString()
  },
  {
    id: 'p-43',
    portal_name: 'Sefaz-SP',
    login: 'difal são paulo - 10101',
    password: '',
    company: 'Medic',
    created_at: new Date().toISOString()
  },

  // --- ARTHROMED PORTALS (26 ITENS) ---
  {
    id: 'art-1',
    portal_name: 'OPMENEXO (Arthromed)',
    login: 'orcamento@arthromed.com.br',
    password: 'Arthromed@2024',
    access_url: 'https://opmenexo.bionexo.com/',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-2',
    portal_name: 'BIONEXO (Arthromed)',
    login: 'orcamento@arthromed.com.br',
    password: 'opme123',
    access_url: 'https://bionexo.com/',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-3',
    portal_name: 'TOP SAUDE - ORIZON (Arthromed)',
    login: 'F17313',
    password: 'Ar@2026*',
    access_url: 'https://opme.orizon.com.br/TSNMVC/Account/Login',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-4',
    portal_name: 'FATURE (Arthromed)',
    login: 'F17313',
    password: 'Arthromed@2026',
    access_url: 'https://www.orizon.com.br/acesso-restrito.html',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-5',
    portal_name: 'CASSI (Arthromed)',
    login: '18.174.173/0001-91',
    password: 'Arthro@18174',
    access_url: 'https://www.cassi.com.br/',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-6',
    portal_name: 'Portal Unidas (Arthromed)',
    login: 'arthromed.pe',
    password: 'Arthro@18174',
    access_url: 'https://www.portalunidassaude.com.br/login.xhtml',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-7',
    portal_name: 'EMS CASSI (Arthromed)',
    login: 'arthromed2',
    password: 'Ar@18174',
    access_url: 'https://cassi.emsgestao.com.br/gestao/www/login.php',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-8',
    portal_name: 'Unimed Natal (Arthromed)',
    login: '18174173000191',
    password: 'Arthro@18174',
    access_url: 'https://portal.unimednatal.com.br/PlanodeSaude/',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-9',
    portal_name: 'EMS CNU (Arthromed)',
    login: 'arthromed2',
    password: 'Ar@18174',
    access_url: 'https://centralnacional.opmes.com.br/gestao/www/login.php',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-10',
    portal_name: 'SEI (Arthromed)',
    login: 'comercial@arthromed.com.br',
    password: 'emtNAKbK',
    access_url: 'https://sei.pi.gov.br/sei/controlador_externo.php?acao=usuario_externo_logar&acao_origem=usuario_externo_logar&id_orgao_acesso_externo=0',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-11',
    portal_name: 'CREDSUS (Arthromed)',
    login: 'comercial@arthromed.com.br',
    password: 'Ar@18174',
    access_url: 'https://credsus.saude.pi.gov.br/web/login',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-12',
    portal_name: 'GEAP PE (Arthromed)',
    login: '15009374',
    password: 'Ar@18174',
    access_url: 'https://www.geap.org.br/',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-13',
    portal_name: 'GEAP PB (Arthromed)',
    login: '13030078',
    password: '18174173',
    access_url: 'https://www.geap.org.br/',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-14',
    portal_name: 'Advice Health (Arthromed)',
    login: 'orcamento@arthromed.com.br',
    password: 'Arthromed@123',
    access_url: 'https://app.advicehealth.com.br/login',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-15',
    portal_name: 'Portal Benner (Arthromed)',
    login: 'orcamento@arthromed.com.br',
    password: 'Ar@18174',
    access_url: 'https://portalconectasaude.com.br/',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-16',
    portal_name: 'PORTAL STELLANTIS (Arthromed)',
    login: 'ARTHROMED',
    password: 'Arthromed31',
    access_url: 'https://portal-ne.stellantissaude.com.br/w_pwsx010.apw',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-17',
    portal_name: 'Portal Sula (Arthromed)',
    login: 'orcamento@arthromed.com.br.enviodoc',
    password: 'Arthro@18174',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-18',
    portal_name: 'Fisco Saude (Arthromed)',
    login: '18.174.173/0001-91',
    password: '@Arthro27',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-19',
    portal_name: 'SAP AMIL (Arthromed)',
    login: 'evie@arthromed.com.br',
    password: 'Arthro@18174',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-20',
    portal_name: 'OPMEWEB (Arthromed)',
    login: 'orcamento@arthromed.com.br',
    password: '@at8231',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-21',
    portal_name: 'WASELER (Arthromed)',
    login: 'orcamento@arthromed.com.br',
    password: '1234',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-22',
    portal_name: 'HUMANA (Arthromed)',
    login: '18174173000191',
    password: 'Ar@18174',
    access_url: 'https://autorizador.humanasaude.com.br/fornecedor/index.php',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-23',
    portal_name: 'GTPLAN (Arthromed)',
    login: 'orcamento@arthromed.com.br',
    password: 'Arthro@18174',
    access_url: 'https://app.gtplan.net/',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-24',
    portal_name: 'INPART (Arthromed)',
    login: 'arthromed1',
    password: '=D20',
    observations: 'Data alteração: 26/06/2026',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-25',
    portal_name: 'EMAIL ARTHROMED',
    login: 'orcamento@arthromed.com.br',
    password: 'Arth@PE#26',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  },
  {
    id: 'art-26',
    portal_name: 'UNIMED FORTALEZA (Arthromed)',
    login: 'ARTHROMED',
    password: '041825@Arthromed',
    observations: 'OPME - Espelho de Autorização',
    company: 'Arthromed',
    created_at: new Date().toISOString()
  }
]

interface PortalPasswordsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PortalPasswordsModal: React.FC<PortalPasswordsModalProps> = ({ isOpen, onClose }) => {
  const [portals, setPortals] = useState<PortalCredential[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [companyFilter, setCompanyFilter] = useState<'Todas' | 'Medic' | 'Arthromed' | 'Ambas'>('Todas')
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Add / Edit Form State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPortal, setEditingPortal] = useState<PortalCredential | null>(null)
  const [formData, setFormData] = useState({
    portal_name: '',
    login: '',
    password: '',
    access_url: '',
    observations: '',
    company: 'Arthromed' as 'Medic' | 'Arthromed' | 'Ambas'
  })
  const [formError, setFormError] = useState('')

  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Sector & Role Permission Check (Visibilidade restrita ao Comercial Interno, T.I / Líder de T.I, Líderes e Gestores)
  const currentSector = (typeof window !== 'undefined' ? localStorage.getItem('userSector') : '') || ''
  const currentLevel = (typeof window !== 'undefined' ? localStorage.getItem('userLevel') : '') || ''
  const currentRole = (typeof window !== 'undefined' ? localStorage.getItem('userRole') : '') || ''
  const cleanSec = currentSector.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const cleanLevel = currentLevel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const cleanRole = currentRole.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  const isComercialInterno = cleanSec.includes('comercial') && cleanSec.includes('interno')
  const isTi = cleanSec.includes('ti') || cleanSec.includes('tecnologia') || cleanSec.includes('suporte') || cleanLevel.includes('ti') || cleanRole.includes('ti')
  const isLider = cleanLevel.includes('lider') || cleanRole.includes('lider') || cleanRole.includes('líder') || cleanSec.includes('lider')
  const isGestor = cleanSec.includes('gestor') || cleanSec.includes('diretor') || cleanSec.includes('coo') || cleanLevel === 'coo' || cleanRole.includes('gestor')
  
  const canViewPasswords = isComercialInterno || isTi || isLider || isGestor

  // Helper to ensure all default portals (Medic + Arthromed) and custom local additions are present and properly company-tagged
  const mergeWithDefaults = (existingList: PortalCredential[]): PortalCredential[] => {
    const listToProcess = (!existingList || !Array.isArray(existingList) || existingList.length === 0)
      ? DEFAULT_PORTALS
      : existingList

    // Ensure every existing item has an explicit company property
    const sanitizedExisting = listToProcess.map(p => ({
      ...p,
      company: p.company || (p.id && p.id.startsWith('art-') ? 'Arthromed' : (p.portal_name && p.portal_name.toLowerCase().includes('arthromed') ? 'Arthromed' : 'Medic'))
    }))

    const existingIds = new Set(sanitizedExisting.map(p => p.id))
    const existingNames = new Set(sanitizedExisting.map(p => (p.portal_name || '').toLowerCase().trim()))

    // Local custom fallback
    let localCustoms: PortalCredential[] = []
    try {
      const savedCustom = localStorage.getItem('custom_portal_passwords')
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom)
        if (Array.isArray(parsed)) {
          localCustoms = parsed.filter(item => !existingIds.has(item.id) && !existingNames.has((item.portal_name || '').toLowerCase().trim()))
        }
      }
    } catch {}
    
    const missingDefaults = DEFAULT_PORTALS.filter(
      def => !existingIds.has(def.id) && !existingNames.has((def.portal_name || '').toLowerCase().trim())
    )

    return [...localCustoms, ...sanitizedExisting, ...missingDefaults]
  }

  // Load Portals (Supabase + LocalStorage Fallback with Auto-Merge & Realtime Sync)
  useEffect(() => {
    if (!isOpen) return

    const fetchPortals = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('portal_passwords')
          .select('*')
          .order('portal_name', { ascending: true })

        if (error || !data || data.length === 0) {
          // Fallback to local storage or defaults
          const saved = localStorage.getItem('portal_passwords_v6') || localStorage.getItem('portal_passwords_v5') || localStorage.getItem('portal_passwords_v4')
          if (saved) {
            try {
              const parsed = JSON.parse(saved)
              const merged = mergeWithDefaults(parsed)
              setPortals(merged)
              localStorage.setItem('portal_passwords_v6', JSON.stringify(merged))
            } catch {
              setPortals(DEFAULT_PORTALS)
              localStorage.setItem('portal_passwords_v6', JSON.stringify(DEFAULT_PORTALS))
            }
          } else {
            setPortals(DEFAULT_PORTALS)
            localStorage.setItem('portal_passwords_v6', JSON.stringify(DEFAULT_PORTALS))
          }
        } else {
          const merged = mergeWithDefaults(data)
          setPortals(merged)
          localStorage.setItem('portal_passwords_v6', JSON.stringify(merged))

          // Auto-seed missing default portals into Supabase in background so all users get them
          const existingIds = new Set(data.map((d: any) => d.id))
          const existingNames = new Set(data.map((d: any) => (d.portal_name || '').toLowerCase().trim()))
          const missing = DEFAULT_PORTALS.filter(
            def => !existingIds.has(def.id) && !existingNames.has((def.portal_name || '').toLowerCase().trim())
          )
          if (missing.length > 0) {
            const cleanSeed = missing.map(m => ({
              id: m.id,
              portal_name: m.portal_name,
              login: m.login || '',
              password: m.password || '',
              access_url: m.access_url || '',
              observations: m.observations || '',
              company: m.company || 'Medic',
              created_at: m.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString()
            }))
            supabase.from('portal_passwords').upsert(cleanSeed).then(({ error: seedErr }) => {
              if (seedErr && seedErr.message.includes('company')) {
                const noComp = cleanSeed.map(({ company, ...rest }) => rest)
                supabase.from('portal_passwords').upsert(noComp)
              }
            })
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar do Supabase, usando cache local:', err)
        const saved = localStorage.getItem('portal_passwords_v6') || localStorage.getItem('portal_passwords_v5') || localStorage.getItem('portal_passwords_v4')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            const merged = mergeWithDefaults(parsed)
            setPortals(merged)
          } catch {
            setPortals(DEFAULT_PORTALS)
          }
        } else {
          setPortals(DEFAULT_PORTALS)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPortals()

    // Realtime channel listener para refletir adições/edições em tempo real para todos os usuários
    const channel = supabase
      .channel('portal_passwords_realtime_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portal_passwords' }, fetchPortals)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Save changes locally and attempt Supabase sync
  const savePortalsState = async (updatedList: PortalCredential[]) => {
    setPortals(updatedList)
    localStorage.setItem('portal_passwords_v6', JSON.stringify(updatedList))
  }

  const resetToDefaults = async () => {
    if (window.confirm('Deseja restaurar a lista padrão de 69 portais (Medic + Arthromed)?')) {
      await savePortalsState(DEFAULT_PORTALS)
    }
  }

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const copyToClipboard = (text: string, fieldKey: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(fieldKey)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const openCreateForm = () => {
    setEditingPortal(null)
    setFormData({
      portal_name: '',
      login: '',
      password: '',
      access_url: '',
      observations: '',
      company: 'Arthromed'
    })
    setFormError('')
    setIsFormOpen(true)
  }

  const openEditForm = (portal: PortalCredential) => {
    setEditingPortal(portal)
    setFormData({
      portal_name: portal.portal_name || '',
      login: portal.login || '',
      password: portal.password || '',
      access_url: portal.access_url || '',
      observations: portal.observations || '',
      company: portal.company || 'Arthromed'
    })
    setFormError('')
    setIsFormOpen(true)
  }

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.portal_name.trim()) {
      setFormError('O nome do portal é obrigatório.')
      return
    }

    let updatedList: PortalCredential[] = []

    if (editingPortal) {
      // Edit existing
      const updatedItem: PortalCredential = {
        ...editingPortal,
        portal_name: formData.portal_name.trim(),
        login: formData.login.trim(),
        password: formData.password.trim(),
        access_url: formData.access_url.trim(),
        observations: formData.observations.trim(),
        company: formData.company,
        updated_at: new Date().toISOString()
      }

      updatedList = portals.map(p => p.id === editingPortal.id ? updatedItem : p)

      // Try Supabase update with fallback schema
      const dbPayload = {
        id: updatedItem.id,
        portal_name: updatedItem.portal_name,
        login: updatedItem.login || '',
        password: updatedItem.password || '',
        access_url: updatedItem.access_url || '',
        observations: updatedItem.observations || '',
        company: updatedItem.company || 'Medic',
        created_at: updatedItem.created_at || new Date().toISOString(),
        updated_at: updatedItem.updated_at
      }

      try {
        const { error } = await supabase
          .from('portal_passwords')
          .upsert(dbPayload)
        if (error) {
          console.warn('Aviso Supabase update:', error.message)
          if (error.message.includes('company')) {
            const { company, ...withoutComp } = dbPayload
            await supabase.from('portal_passwords').upsert(withoutComp)
          }
        }
      } catch (err) {
        console.warn('Falha na atualização remota Supabase:', err)
      }
    } else {
      // Add new
      const newItem: PortalCredential = {
        id: 'portal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        portal_name: formData.portal_name.trim(),
        login: formData.login.trim(),
        password: formData.password.trim(),
        access_url: formData.access_url.trim(),
        observations: formData.observations.trim(),
        company: formData.company,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      updatedList = [newItem, ...portals]

      // Guard in local custom storage backup
      try {
        const savedCustom = localStorage.getItem('custom_portal_passwords')
        const currentCustoms: PortalCredential[] = savedCustom ? JSON.parse(savedCustom) : []
        localStorage.setItem('custom_portal_passwords', JSON.stringify([newItem, ...currentCustoms]))
      } catch {}

      // Try Supabase insert with fallback schema
      const dbPayload = {
        id: newItem.id,
        portal_name: newItem.portal_name,
        login: newItem.login || '',
        password: newItem.password || '',
        access_url: newItem.access_url || '',
        observations: newItem.observations || '',
        company: newItem.company || 'Medic',
        created_at: newItem.created_at,
        updated_at: newItem.updated_at
      }

      try {
        const { error } = await supabase
          .from('portal_passwords')
          .upsert(dbPayload)
        if (error) {
          console.warn('Aviso Supabase insert:', error.message)
          if (error.message.includes('company')) {
            const { company, ...withoutComp } = dbPayload
            await supabase.from('portal_passwords').upsert(withoutComp)
          }
        }
      } catch (err) {
        console.warn('Falha na inserção remota Supabase:', err)
      }
    }

    await savePortalsState(updatedList)
    setIsFormOpen(false)
    setEditingPortal(null)
  }

  const handleDelete = async (id: string) => {
    const updatedList = portals.filter(p => p.id !== id)
    await savePortalsState(updatedList)

    // Remove from custom local storage if present
    try {
      const savedCustom = localStorage.getItem('custom_portal_passwords')
      if (savedCustom) {
        const parsed: PortalCredential[] = JSON.parse(savedCustom)
        localStorage.setItem('custom_portal_passwords', JSON.stringify(parsed.filter(p => p.id !== id)))
      }
    } catch {}

    setDeletingId(null)

    // Try Supabase delete
    try {
      await supabase
        .from('portal_passwords')
        .delete()
        .eq('id', id)
    } catch (err) {
      console.warn('Falha na deleção remota Supabase:', err)
    }
  }

  // Consistent company getter for portals with fallback
  const getPortalCompany = (p: PortalCredential): 'Medic' | 'Arthromed' | 'Ambas' => {
    if (p.company) return p.company
    if (p.id && p.id.startsWith('art-')) return 'Arthromed'
    if (p.portal_name && p.portal_name.toLowerCase().includes('arthromed')) return 'Arthromed'
    return 'Medic'
  }

  // Count by company
  const medicCount = portals.filter(p => getPortalCompany(p) === 'Medic').length
  const arthromedCount = portals.filter(p => getPortalCompany(p) === 'Arthromed').length
  const ambasCount = portals.filter(p => getPortalCompany(p) === 'Ambas').length

  // Filtered portals list
  const filteredPortals = portals.filter(p => {
    // Filter by company
    const pCompany = getPortalCompany(p)
    if (companyFilter !== 'Todas' && pCompany !== companyFilter) {
      return false
    }

    // Filter by search term
    const term = searchTerm.toLowerCase().trim()
    if (!term) return true
    return (
      (p.portal_name || '').toLowerCase().includes(term) ||
      (p.login || '').toLowerCase().includes(term) ||
      (p.access_url || '').toLowerCase().includes(term) ||
      (p.observations || '').toLowerCase().includes(term)
    )
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-purple-600 text-white flex items-center justify-center shadow-md shrink-0">
              <KeyRound size={20} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-slate-800 tracking-tight leading-tight">
                  Senhas dos Portais
                </h3>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-200 shrink-0">
                  Comercial Interno & T.I
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                Credenciais e links organizados por empresa (Medic Ortopedia & Arthromed OPME).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Top Company Color Legend & Filter Banner */}
        <div className="px-5 py-2.5 bg-slate-100/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-extrabold text-slate-600 text-[11px] uppercase tracking-wider">
              Identificação por Empresa:
            </span>
            <div className="flex items-center gap-1.5 bg-emerald-100/80 text-emerald-800 px-2.5 py-1 rounded-lg font-bold border border-emerald-300 text-[11px] shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-2xs" />
              <span>Medic Ortopedia</span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-100/80 text-purple-800 px-2.5 py-1 rounded-lg font-bold border border-purple-300 text-[11px] shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block shadow-2xs" />
              <span>Arthromed OPME</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-100/80 text-amber-800 px-2.5 py-1 rounded-lg font-bold border border-amber-300 text-[11px] shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-2xs" />
              <span>Ambas / Geral</span>
            </div>
          </div>
        </div>

        {/* Toolbar: Company Tabs, Search & Add Button */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Company Filter Tabs */}
          <div className="bg-slate-200/70 p-1 rounded-xl flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setCompanyFilter('Todas')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
              style={{
                backgroundColor: companyFilter === 'Todas' ? '#1e293b' : 'transparent',
                color: companyFilter === 'Todas' ? '#ffffff' : '#475569',
              }}
            >
              Todas ({portals.length})
            </button>
            <button
              type="button"
              onClick={() => setCompanyFilter('Medic')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              style={{
                backgroundColor: companyFilter === 'Medic' ? '#059669' : 'transparent',
                color: companyFilter === 'Medic' ? '#ffffff' : '#047857',
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: companyFilter === 'Medic' ? '#a7f3d0' : '#10b981' }}
              />
              <span>Medic ({medicCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setCompanyFilter('Arthromed')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              style={{
                backgroundColor: companyFilter === 'Arthromed' ? '#7c3aed' : 'transparent',
                color: companyFilter === 'Arthromed' ? '#ffffff' : '#6d28d9',
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: companyFilter === 'Arthromed' ? '#e9d5ff' : '#a855f7' }}
              />
              <span>Arthromed ({arthromedCount})</span>
            </button>
            {ambasCount > 0 && (
              <button
                type="button"
                onClick={() => setCompanyFilter('Ambas')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                style={{
                  backgroundColor: companyFilter === 'Ambas' ? '#d97706' : 'transparent',
                  color: companyFilter === 'Ambas' ? '#ffffff' : '#b45309',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: companyFilter === 'Ambas' ? '#fde68a' : '#f59e0b' }}
                />
                <span>Ambas ({ambasCount})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Pesquisar portal, login ou endereço..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Limpar
                </button>
              )}
            </div>

            {canViewPasswords && (
              <button
                type="button"
                onClick={openCreateForm}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0 whitespace-nowrap"
                style={{
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                }}
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Novo Portal</span>
              </button>
            )}
          </div>

        </div>

        {/* Modal Content / Cards Grid */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-slate-50/30">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Carregando senhas dos portais...</span>
            </div>
          ) : filteredPortals.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-slate-200 p-8">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <Globe size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Nenhum portal encontrado</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {searchTerm
                  ? 'Nenhum resultado corresponde à sua pesquisa. Tente refinar a busca.'
                  : 'Nenhum portal cadastrado para o filtro selecionado.'}
              </p>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="mt-3 text-xs font-bold text-purple-600 hover:underline cursor-pointer"
                >
                  Limpar filtro de pesquisa
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPortals.map(portal => {
                const isPasswordVisible = visiblePasswords[portal.id] || false
                const isLoginCopied = copiedField === `login-${portal.id}`
                const isPassCopied = copiedField === `pass-${portal.id}`
                const pCompany = getPortalCompany(portal)

                // Color Themes by Company
                const isMedic = pCompany === 'Medic'
                const isArthromed = pCompany === 'Arthromed'

                const cardBorder = isMedic
                  ? 'border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-500/10'
                  : isArthromed
                  ? 'border-purple-200 hover:border-purple-400 hover:shadow-purple-500/10'
                  : 'border-amber-200 hover:border-amber-400 hover:shadow-amber-500/10'

                const badgeStyle = isMedic
                  ? 'bg-emerald-100/90 text-emerald-800 border-emerald-200'
                  : isArthromed
                  ? 'bg-purple-100/90 text-purple-800 border-purple-200'
                  : 'bg-amber-100/90 text-amber-800 border-amber-200'

                const iconBoxStyle = isMedic
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : isArthromed
                  ? 'bg-purple-50 text-purple-600 border-purple-200'
                  : 'bg-amber-50 text-amber-600 border-amber-200'

                return (
                  <div
                    key={portal.id}
                    className={`bg-white rounded-2xl border shadow-2xs hover:shadow-md transition-all p-4 flex flex-col justify-between group relative overflow-hidden ${cardBorder}`}
                  >
                    <div className="space-y-3">
                      
                      {/* Card Header: Name + Company Badge + Actions */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${iconBoxStyle}`}>
                            <Globe size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-sm font-extrabold text-slate-800 truncate leading-tight">
                                {portal.portal_name}
                              </h4>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md border shrink-0 ${badgeStyle}`}>
                                {isMedic ? '🟢 Medic' : isArthromed ? '🟣 Arthromed' : '🟡 Ambas'}
                              </span>
                            </div>

                            {portal.access_url && (
                              <a
                                href={portal.access_url.startsWith('http') ? portal.access_url : `https://${portal.access_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 hover:underline truncate mt-0.5 max-w-full"
                                title="Abrir link em nova aba"
                              >
                                <span className="truncate">{portal.access_url.replace(/^https?:\/\//, '')}</span>
                                <ExternalLink size={10} className="shrink-0" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Card Action Buttons: Edit & Delete */}
                        {canViewPasswords && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditForm(portal)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Editar credencial"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingId(portal.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Remover portal"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Login Field */}
                      <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <User size={13} className="text-slate-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">
                              Login / Usuário
                            </span>
                            <span className="text-xs font-bold text-slate-800 truncate block mt-0.5 select-all">
                              {portal.login || '(Sem login específico)'}
                            </span>
                          </div>
                        </div>
                        {portal.login && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(portal.login, `login-${portal.id}`)}
                            className="p-1.5 rounded-lg border text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                            style={{
                              backgroundColor: isLoginCopied ? '#ecfdf5' : '#ffffff',
                              color: isLoginCopied ? '#059669' : '#64748b',
                              borderColor: isLoginCopied ? '#a7f3d0' : '#e2e8f0',
                            }}
                            title="Copiar login"
                          >
                            {isLoginCopied ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Lock size={13} className="text-slate-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">
                              Senha de Acesso
                            </span>
                            <span className={`text-xs block mt-0.5 truncate select-all ${portal.password ? 'font-mono font-bold text-slate-800' : 'text-slate-400 font-medium italic'}`}>
                              {portal.password
                                ? (canViewPasswords ? (isPasswordVisible ? portal.password : '••••••••••••') : '••••••••••••')
                                : 'Sem senha cadastrada'}
                            </span>
                          </div>
                        </div>

                        {portal.password ? (
                          canViewPasswords ? (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(portal.id)}
                                className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                title={isPasswordVisible ? 'Ocultar senha' : 'Exibir senha'}
                              >
                                {isPasswordVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(portal.password || '', `pass-${portal.id}`)}
                                className="p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer"
                                style={{
                                  backgroundColor: isPassCopied ? '#ecfdf5' : '#ffffff',
                                  color: isPassCopied ? '#059669' : '#64748b',
                                  borderColor: isPassCopied ? '#a7f3d0' : '#e2e8f0',
                                }}
                                title="Copiar senha"
                              >
                                {isPassCopied ? <Check size={13} /> : <Copy size={13} />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 shadow-2xs">
                              <Lock size={10} />
                              <span>Restrito Comercial Interno</span>
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                            Acesso Direto
                          </span>
                        )}
                      </div>

                      {/* Observations / Instructions */}
                      {portal.observations && (
                        <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5 text-xs text-amber-900 flex items-start gap-2">
                          <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-[11px] font-medium leading-relaxed">
                            {portal.observations}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-purple-600" />
              <span className="font-semibold text-slate-600">
                {filteredPortals.length} {filteredPortals.length === 1 ? 'portal cadastrado' : 'portais cadastrados'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            style={{ backgroundColor: '#f1f5f9', color: '#334155' }}
          >
            Fechar
          </button>
        </div>

      </div>

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="text-sm font-extrabold text-slate-800">
                {editingPortal ? 'Editar Portal' : 'Cadastrar Novo Portal'}
              </h4>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-3.5">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Empresa Pertencente <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, company: 'Medic' })}
                    className="py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    style={{
                      backgroundColor: formData.company === 'Medic' ? '#059669' : '#f8fafc',
                      color: formData.company === 'Medic' ? '#ffffff' : '#334155',
                      borderColor: formData.company === 'Medic' ? '#059669' : '#e2e8f0',
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: formData.company === 'Medic' ? '#a7f3d0' : '#10b981' }}
                    />
                    <span>Medic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, company: 'Arthromed' })}
                    className="py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    style={{
                      backgroundColor: formData.company === 'Arthromed' ? '#7c3aed' : '#f8fafc',
                      color: formData.company === 'Arthromed' ? '#ffffff' : '#334155',
                      borderColor: formData.company === 'Arthromed' ? '#7c3aed' : '#e2e8f0',
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: formData.company === 'Arthromed' ? '#e9d5ff' : '#a855f7' }}
                    />
                    <span>Arthromed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, company: 'Ambas' })}
                    className="py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    style={{
                      backgroundColor: formData.company === 'Ambas' ? '#d97706' : '#f8fafc',
                      color: formData.company === 'Ambas' ? '#ffffff' : '#334155',
                      borderColor: formData.company === 'Ambas' ? '#d97706' : '#e2e8f0',
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: formData.company === 'Ambas' ? '#fde68a' : '#f59e0b' }}
                    />
                    <span>Ambas</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Portal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.portal_name}
                  onChange={e => setFormData({ ...formData, portal_name: e.target.value })}
                  placeholder="Ex: Portal Saúde Caixa, Portal Bradesco..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Login / Usuário
                  </label>
                  <input
                    type="text"
                    value={formData.login}
                    onChange={e => setFormData({ ...formData, login: e.target.value })}
                    placeholder="Ex: comercial@arthromed.com.br"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Senha de Acesso <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Ex: Senha123 (deixe em branco se não houver)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Endereço de Acesso (URL)
                </label>
                <input
                  type="url"
                  value={formData.access_url}
                  onChange={e => setFormData({ ...formData, access_url: e.target.value })}
                  placeholder="https://opmenexo.bionexo.com/"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observações / Código de Prestador
                </label>
                <textarea
                  rows={2}
                  value={formData.observations}
                  onChange={e => setFormData({ ...formData, observations: e.target.value })}
                  placeholder="Ex: Código prestador 82384. Necessário token de validação."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  style={{ backgroundColor: '#f1f5f9', color: '#334155' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  style={{ backgroundColor: '#7c3aed', color: '#ffffff' }}
                >
                  {editingPortal ? 'Salvar Alterações' : 'Cadastrar Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-5 space-y-4 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-800">Remover Portal?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Esta ação excluirá as credenciais deste portal. Deseja continuar?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                style={{ backgroundColor: '#f1f5f9', color: '#334155' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
