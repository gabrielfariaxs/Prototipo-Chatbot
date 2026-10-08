import React, { useState, useEffect, useMemo } from 'react';
import { X, Play, Plus, Edit, Trash2, Search, Video as VideoIcon, Clock, Link as LinkIcon, Save, Eye, Users, Sparkles, Check, Film, Layers, Filter, Image as ImageIcon, ExternalLink, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { LinkifiedText } from '../common/LinkifiedText';

interface CatalogoVideosModalProps {
  onClose: () => void;
}

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  driveLink: string;
  category: string; // Setor
  moduleTopic?: string; // Módulo / Processo
  thumbnailUrl?: string; // Capa personalizada opcional
  addedBy: string;
  addedAt: string;
}

interface AccessLog {
  id: string;
  videoId: string;
  userName: string;
  userSector: string;
  accessedAt: string;
}

const SETORES_TREINAMENTO = [
  'Geral',
  'Comercial interno',
  'Comercial externo',
  'Instrumentação',
  'T.I',
  'Qualidade / RT',
  'Gente Gestão',
  'Financeiro',
  'Estoque e logistica',
  'Supply Chain',
  'Compras',
  'Operações',
  'Gestor/Diretoria'
];

const SECTOR_THEMES: Record<string, { bg: string; accent: string; glow: string }> = {
  'Comercial interno': {
    bg: 'from-[#0b1329] via-[#151c3d] to-[#1e295d]',
    accent: '#3b82f6',
    glow: 'bg-blue-600/30'
  },
  'Comercial externo': {
    bg: 'from-[#061826] via-[#0b2b40] to-[#13495f]',
    accent: '#06b6d4',
    glow: 'bg-cyan-500/30'
  },
  'Instrumentação': {
    bg: 'from-[#071f30] via-[#0c3954] to-[#115779]',
    accent: '#38bdf8',
    glow: 'bg-sky-500/30'
  },
  'T.I': {
    bg: 'from-[#040817] via-[#0a1636] to-[#132c63]',
    accent: '#6366f1',
    glow: 'bg-indigo-600/30'
  },
  'Qualidade / RT': {
    bg: 'from-[#021f18] via-[#06382a] to-[#0c5940]',
    accent: '#10b981',
    glow: 'bg-emerald-500/30'
  },
  'Gente Gestão': {
    bg: 'from-[#1e0a38] via-[#351460] to-[#511c8a]',
    accent: '#c084fc',
    glow: 'bg-purple-600/30'
  },
  'Financeiro': {
    bg: 'from-[#022115] via-[#053d26] to-[#0a5e38]',
    accent: '#34d399',
    glow: 'bg-emerald-600/30'
  },
  'Estoque e logistica': {
    bg: 'from-[#260f03] via-[#4a2007] to-[#78350f]',
    accent: '#f59e0b',
    glow: 'bg-amber-600/30'
  },
  'Supply Chain': {
    bg: 'from-[#1a1715] via-[#332a24] to-[#544439]',
    accent: '#fb923c',
    glow: 'bg-orange-600/30'
  },
  'Compras': {
    bg: 'from-[#051f24] via-[#0c3942] to-[#155663]',
    accent: '#2dd4bf',
    glow: 'bg-teal-500/30'
  },
  'Operações': {
    bg: 'from-[#0f172a] via-[#1e293b] to-[#334155]',
    accent: '#94a3b8',
    glow: 'bg-slate-500/30'
  },
  'Gestor/Diretoria': {
    bg: 'from-[#0a0a0c] via-[#1c1c22] to-[#30303a]',
    accent: '#f1f5f9',
    glow: 'bg-slate-400/20'
  },
  'Geral': {
    bg: 'from-[#0d1522] via-[#1b497d] to-[#17a398]',
    accent: '#38bdf8',
    glow: 'bg-teal-500/30'
  }
};

const SECTOR_DEFAULT_COVERS: Record<string, string> = {
  'Comercial interno': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
  'Comercial externo': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
  'Instrumentação': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
  'T.I': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
  'Qualidade / RT': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
  'Gente Gestão': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  'Financeiro': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
  'Estoque e logistica': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  'Supply Chain': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  'Compras': 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
  'Operações': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  'Gestor/Diretoria': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
  'Geral': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
};

const DEFAULT_GLOBAL_COVER = '/treinamento.treinaflix.png';

const getYouTubeThumbnail = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

const getEffectiveThumbnail = (video: Partial<Video>): string | null => {
  if (video.thumbnailUrl && video.thumbnailUrl.trim()) {
    return video.thumbnailUrl.trim();
  }
  if (video.driveLink) {
    const yt = getYouTubeThumbnail(video.driveLink);
    if (yt) return yt;
  }
  // Capa oficial Treinaflix padrão
  return DEFAULT_GLOBAL_COVER;
};

const getProviderInfo = (rawUrl?: string) => {
  if (!rawUrl || !rawUrl.trim()) return null;
  const url = rawUrl.toLowerCase();
  if (url.startsWith('/') || url.startsWith('./') || (!url.startsWith('http') && url.includes('.mp4'))) {
    return { name: 'Vídeo Local (web/public)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  }
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    return { name: 'Google Drive', color: 'text-blue-700 bg-blue-50 border-blue-200' };
  }
  if (url.includes('sharepoint.com') || url.includes('onedrive.live.com') || url.includes('1drv.ms') || url.includes('teams.microsoft.com') || url.includes('stream.office.com')) {
    return { name: 'OneDrive / SharePoint / Teams', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return { name: 'YouTube', color: 'text-red-700 bg-red-50 border-red-200' };
  }
  if (url.includes('vimeo.com')) {
    return { name: 'Vimeo', color: 'text-sky-700 bg-sky-50 border-sky-200' };
  }
  if (url.includes('loom.com')) {
    return { name: 'Loom', color: 'text-purple-700 bg-purple-50 border-purple-200' };
  }
  if (/\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(rawUrl)) {
    return { name: 'Arquivo Direto (.mp4)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  }
  return { name: 'Link Web', color: 'text-slate-700 bg-slate-100 border-slate-200' };
};

const DEFAULT_VIDEOS: Video[] = [
  {
    id: 'v1',
    title: 'Integração de Novos Colaboradores 2026',
    description: 'Tudo o que você precisa saber para o seu primeiro dia. Conheça nossa cultura, nossos sistemas e as regras gerais da empresa.',
    duration: '45:20',
    driveLink: 'https://drive.google.com/file/d/1_EXEMPLO_ID_AQUI/preview',
    category: 'Gente Gestão',
    moduleTopic: 'Cultura & Regras Gerais',
    addedBy: 'T.I',
    addedAt: new Date().toISOString()
  },
  {
    id: 'v2',
    title: 'Treinamento – Plataforma NAT SUIT e Portal do Fornecedor',
    description: 'Gravação da capacitação e alinhamento operacional sobre a Plataforma NAT SUIT e processos no Portal do Fornecedor.',
    duration: '50:00',
    driveLink: 'https://1drv.ms/v/c/c1bb3447ac2c025d/IQSfVBljjhNrRpkJv6eXleivAcICF_haqf9G9iMBhOTCcT0',
    category: 'Compras',
    moduleTopic: 'NAT SUIT & Portal do Fornecedor',
    addedBy: 'T.I',
    addedAt: '2026-07-24T10:30:40.000Z'
  }
];

export const CatalogoVideosModal: React.FC<CatalogoVideosModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('Todos');
  const [videos, setVideos] = useState<Video[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Partial<Video>>({});
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);
  
  const [showLogsMode, setShowLogsMode] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const userName = typeof window !== 'undefined' ? (localStorage.getItem('userName') || 'Usuário') : 'Usuário';
  const userSector = typeof window !== 'undefined' ? (localStorage.getItem('userSector') || '') : '';
  const userLevel = typeof window !== 'undefined' ? (localStorage.getItem('userLevel') || '') : '';

  const normalizedSector = userSector.toLowerCase();
  const isTiOrOps = normalizedSector.includes('ti') || normalizedSector.includes('tecnologia') || normalizedSector.includes('operaç') || normalizedSector.includes('operac');
  const isGestor = normalizedSector.includes('gestor') || normalizedSector.includes('diretor') || userLevel === 'coo';

  // Apenas líderes de T.I, Operações ou o Gestor Geral têm acesso para ver logs.
  const isLeader = isTiOrOps || isGestor;

const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds) || seconds === Infinity || seconds <= 0) return '45:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const extractDurationFromUrlOrText = (text: string): string => {
  if (!text) return '45:00';
  const hourMinMatch = text.match(/(\d+)\s*h(?:oras?)?\s*(\d+)?\s*(?:min|m)?/i);
  if (hourMinMatch) {
    const h = parseInt(hourMinMatch[1]);
    const m = hourMinMatch[2] ? parseInt(hourMinMatch[2]) : 0;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
  }
  const minMatch = text.match(/(\d+)\s*(?:min|m|minutos)/i);
  if (minMatch) {
    const m = parseInt(minMatch[1]);
    if (m > 0 && m < 300) {
      return `${m.toString().padStart(2, '0')}:00`;
    }
  }
  // Padrão inteligente de treinamentos corporativos
  return '45:00';
};

  useEffect(() => {
    const storedVideos = localStorage.getItem('treinaflix_videos');
    if (storedVideos) {
      try {
        let parsed: Video[] = JSON.parse(storedVideos);
        // Atualizar se houver o v2 antigo e preencher durações 00:00 automaticamente
        parsed = parsed.map(v => {
          let link = v.driveLink;
          let duration = v.duration;
          if (v.id === 'v2' || v.title.includes('NAT SUIT')) {
            link = 'https://1drv.ms/v/c/c1bb3447ac2c025d/IQSfVBljjhNrRpkJv6eXleivAcICF_haqf9G9iMBhOTCcT0';
            duration = '50:00';
          }
          if (!duration || duration === '00:00' || duration === '0:00') {
            duration = extractDurationFromUrlOrText(v.title + ' ' + (v.moduleTopic || ''));
          }
          return {
            ...v,
            driveLink: link,
            duration: duration || '45:00'
          };
        });

        const existingLinks = new Set(parsed.map(v => v.driveLink || v.id));
        const toAdd = DEFAULT_VIDEOS.filter(dv => !existingLinks.has(dv.driveLink) && !existingLinks.has(dv.id));
        const merged = [...parsed, ...toAdd];
        setVideos(merged);
        localStorage.setItem('treinaflix_videos', JSON.stringify(merged));
      } catch {
        setVideos(DEFAULT_VIDEOS);
        localStorage.setItem('treinaflix_videos', JSON.stringify(DEFAULT_VIDEOS));
      }
    } else {
      setVideos(DEFAULT_VIDEOS);
      localStorage.setItem('treinaflix_videos', JSON.stringify(DEFAULT_VIDEOS));
    }
    
    const storedLogs = localStorage.getItem('treinaflix_logs');
    if (storedLogs) {
      setAccessLogs(JSON.parse(storedLogs));
    }
  }, []);

  const saveVideos = (newVideos: Video[]) => {
    setVideos(newVideos);
    localStorage.setItem('treinaflix_videos', JSON.stringify(newVideos));
  };

  const updateVideoDuration = (id: string, newDuration: string) => {
    if (!id || !newDuration || newDuration === '00:00' || newDuration === '0:00') return;
    setVideos(prev => {
      const updated = prev.map(v => v.id === id ? { ...v, duration: newDuration } : v);
      localStorage.setItem('treinaflix_videos', JSON.stringify(updated));
      return updated;
    });
    if (playingVideo && playingVideo.id === id) {
      setPlayingVideo(prev => prev ? { ...prev, duration: newDuration } : null);
    }
  };

  const handleStartCreate = () => {
    setEditingVideo({
      title: '',
      driveLink: '',
      category: 'Geral',
      moduleTopic: '',
      duration: '45:00',
      addedBy: userName,
      description: ''
    });
    setIsEditing(true);
  };

  const handleStartEdit = (video: Video) => {
    setEditingVideo({
      ...video,
      addedBy: video.addedBy || userName,
      category: video.category || 'Geral',
      moduleTopic: video.moduleTopic || '',
      duration: (video.duration && video.duration !== '00:00') ? video.duration : '45:00'
    });
    setIsEditing(true);
  };

  const handleSaveVideo = () => {
    if (!editingVideo.driveLink || !editingVideo.driveLink.trim()) return;

    const finalTitle = editingVideo.title?.trim() || `Treinamento ${editingVideo.moduleTopic ? '- ' + editingVideo.moduleTopic : (editingVideo.category || 'Geral')}`;
    const finalAddedBy = editingVideo.addedBy !== undefined && editingVideo.addedBy.trim() !== ''
      ? editingVideo.addedBy.trim()
      : userName;
    const finalDuration = (editingVideo.duration && editingVideo.duration.trim() !== '' && editingVideo.duration !== '00:00' && editingVideo.duration !== '0:00')
      ? editingVideo.duration.trim()
      : extractDurationFromUrlOrText(finalTitle + ' ' + (editingVideo.driveLink || ''));

    if (editingVideo.id) {
      // Edit
      saveVideos(videos.map(v => v.id === editingVideo.id ? { 
        ...v, 
        ...editingVideo,
        title: finalTitle,
        duration: finalDuration,
        driveLink: editingVideo.driveLink?.trim() || '',
        thumbnailUrl: editingVideo.thumbnailUrl?.trim() || undefined,
        addedBy: finalAddedBy,
        category: editingVideo.category || 'Geral',
        moduleTopic: editingVideo.moduleTopic?.trim() || ''
      } as Video : v));
    } else {
      // Create
      const newVideo: Video = {
        id: Date.now().toString(),
        title: finalTitle,
        description: editingVideo.description || `Gravação de capacitação e alinhamento operacional sobre ${finalTitle}.`,
        duration: finalDuration,
        driveLink: editingVideo.driveLink.trim(),
        category: editingVideo.category || 'Geral',
        moduleTopic: editingVideo.moduleTopic?.trim() || '',
        thumbnailUrl: editingVideo.thumbnailUrl?.trim() || undefined,
        addedBy: finalAddedBy,
        addedAt: new Date().toISOString()
      };
      saveVideos([...videos, newVideo]);
    }
    setIsEditing(false);
    setEditingVideo({});
  };

  const handleDeleteVideo = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este vídeo?')) {
      saveVideos(videos.filter(v => v.id !== id));
    }
  };

  const handlePlayVideo = (video: Video) => {
    setIsPlayerLoading(true);
    const newLog: AccessLog = {
      id: Date.now().toString(),
      videoId: video.id,
      userName: userName,
      userSector: userSector,
      accessedAt: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...accessLogs];
    setAccessLogs(updatedLogs);
    localStorage.setItem('treinaflix_logs', JSON.stringify(updatedLogs));
    setPlayingVideo(video);
  };

  const detectCategoryFromText = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes('gop') || t.includes('qualidade') || t.includes('rt') || t.includes('pop') || t.includes('auditoria')) return 'Qualidade / RT';
    if (t.includes('fatur') || t.includes('comercial interno') || t.includes('orcamento') || t.includes('orçamento') || t.includes('proposta') || t.includes('glosa')) return 'Comercial interno';
    if (t.includes('comercial externo') || t.includes('venda') || t.includes('cliente') || t.includes('medico') || t.includes('médico')) return 'Comercial externo';
    if (t.includes('instrumenta') || t.includes('cirurg')) return 'Instrumentação';
    if (t.includes('ti') || t.includes('sistema') || t.includes('protheus') || t.includes('software') || t.includes('tecnologia') || t.includes('docusign') || t.includes('setup')) return 'T.I';
    if (t.includes('financeiro') || t.includes('banco') || t.includes('pagamento') || t.includes('conta') || t.includes('caixa')) return 'Financeiro';
    if (t.includes('logistica') || t.includes('logística') || t.includes('estoque') || t.includes('entrega') || t.includes('rastreio')) return 'Estoque e logistica';
    if (t.includes('supply') || t.includes('cadeia') || t.includes('opme')) return 'Supply Chain';
    if (t.includes('compra') || t.includes('cotacao') || t.includes('cotação') || t.includes('fornecedor')) return 'Compras';
    if (t.includes('operac') || t.includes('operaç')) return 'Operações';
    if (t.includes('gestor') || t.includes('diretor') || t.includes('coo')) return 'Gestor/Diretoria';
    if (t.includes('gente') || t.includes('rh') || t.includes('departamento pessoal') || t.includes('folha') || t.includes('onboarding') || t.includes('integra')) return 'Gente Gestão';
    return 'Geral';
  };

  const isValidReadableTitle = (str: string): boolean => {
    if (!str || str.length < 3 || str.length > 150) return false;
    
    // Ignorar parâmetros de URL e palavras reservadas comuns
    const lower = str.toLowerCase();
    const ignoredTokens = [
      'preview', 'embedview', 'view', 'edit', 'download', 'authkey', 'resid', 'sharing', 
      'usp', '1drv', 'onedrive', 'sharepoint', 'teams', 'youtube', 'google', 'drive', 
      'file', 'video', 'watch', 'null', 'undefined'
    ];
    if (ignoredTokens.includes(lower)) return false;

    // Se for apenas parâmetro curto de query (ex: A6Vclv) ou token sem separadores nem vogais
    if (/^[a-zA-Z0-9]{3,10}$/.test(str) && !/(treina|aula|video|reuni|capaci|proc|gop|fatur|sist|port|guia)/i.test(str)) {
      return false;
    }

    // Se for hash hexadecimal (ex: c1bb3447ac2c025d)
    if (/^[0-9a-fA-F]{10,}$/.test(str)) return false;

    // Se for token base64 longo sem espaços (ex: IQCfVBljjhNrRpkJv6eXIeivARSye1IKTadnMDfqlFvpifc)
    if (/^[a-zA-Z0-9_-]{16,}$/.test(str) && !str.includes(' ') && !str.includes('-') && !str.includes('_')) {
      return false;
    }

    // Requer ter separadores de palavras (espaço, traço, sublinhado), extensão de arquivo de vídeo ou palavras-chave conhecidas
    const hasSeparators = /[ _-]/.test(str);
    const hasExtension = /\.(mp4|mov|mkv|avi|webm|m4v)/i.test(str);
    const hasKeywords = /(treina|capacita|reuni|aula|apresenta|alinhamento|processo|modulo|sistema|fatur|comercial|estoque|financeiro|gop|rt|qualidade|ti|onboarding)/i.test(str);

    return hasSeparators || hasExtension || hasKeywords;
  };

  const autoFillFromLink = async (rawUrl: string) => {
    if (!rawUrl || !rawUrl.trim()) return;
    const cleanUrl = rawUrl.trim();
    setIsExtracting(true);

    let extractedTitle = '';
    let extractedCategory = 'Geral';

    // 1. YouTube oEmbed
    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
      try {
        const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(cleanUrl)}`);
        const data = await res.json();
        if (data && data.title && isValidReadableTitle(data.title)) {
          extractedTitle = data.title;
          extractedCategory = detectCategoryFromText(data.title);
        }
      } catch {
        // Fallback
      }
    }

    // 2. OneDrive / SharePoint / Teams / Google Drive
    if (!extractedTitle) {
      try {
        const decoded = decodeURIComponent(cleanUrl);
        
        // Extrair nome do arquivo a partir dos parâmetros de URL ou path
        const pathSegments = decoded.split(/[/?&=#]/);
        let candidateName = '';

        for (const segment of pathSegments.reverse()) {
          const s = segment.trim();
          if (isValidReadableTitle(s)) {
            candidateName = s;
            break;
          }
        }

        if (candidateName) {
          let cleaned = candidateName
            .replace(/\.(mp4|mov|mkv|avi|webm|m4v)/gi, '')
            .replace(/[-_]?(grava[cç][aã]o\s+da\s+reuni[aã]o|grava[cç][aã]o|meeting\s+recording|recording)/gi, '')
            .replace(/[-_]?\d{8}[-_]?\d{4,6}/g, '') // Remove 20261006_143000
            .replace(/[-_]?\d{4}-\d{2}-\d{2}/g, '') // Remove datas 2026-10-06
            .replace(/[-_+]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          if (cleaned.length >= 3 && isValidReadableTitle(cleaned)) {
            extractedTitle = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
            extractedCategory = detectCategoryFromText(extractedTitle);
          }
        }
      } catch {
        // Fallback
      }
    }

    setIsExtracting(false);

    const detectedDuration = extractDurationFromUrlOrText(cleanUrl + ' ' + extractedTitle);

    if (extractedTitle) {
      setEditingVideo(prev => ({
        ...prev,
        driveLink: cleanUrl,
        title: prev.title || extractedTitle,
        duration: prev.duration && prev.duration !== '00:00' ? prev.duration : detectedDuration,
        category: prev.category && prev.category !== 'Geral' ? prev.category : extractedCategory,
        description: prev.description || `Gravação de capacitação e alinhamento operacional sobre ${extractedTitle}.`
      }));
      setAutoDetected(true);
      setTimeout(() => setAutoDetected(false), 5000);
    } else {
      setEditingVideo(prev => ({ 
        ...prev, 
        driveLink: cleanUrl,
        duration: prev.duration && prev.duration !== '00:00' ? prev.duration : detectedDuration
      }));
    }
  };

  const sanitizeVideoUrl = (raw: string): string => {
    if (!raw) return '';
    let url = raw.trim();
    if (url.includes('<iframe') && url.includes('src=')) {
      const match = url.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) {
        url = match[1];
      }
    }
    url = url.replace(/^["']|["']$/g, '').trim();
    return url;
  };

  const isDirectVideoFile = (rawUrl?: string): boolean => {
    if (!rawUrl) return false;
    const url = rawUrl.trim().toLowerCase();
    return (
      /\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i.test(url) ||
      (url.startsWith('/') && !url.includes('drive.google') && !url.includes('1drv.ms') && !url.includes('youtube')) ||
      url.startsWith('./') ||
      (!url.startsWith('http://') && !url.startsWith('https://') && url.includes('.mp4'))
    );
  };

  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl) return '';
    const url = sanitizeVideoUrl(rawUrl);

    // Se for arquivo colocado em web/public (ex: /video.mp4 ou video.mp4)
    if (isDirectVideoFile(url) && !url.startsWith('http://') && !url.startsWith('https://')) {
      return url.startsWith('/') ? url : `/${url}`;
    }

    // 1. Google Drive & Google Docs (Suporta /d/ID, /file/d/ID, /file/u/X/d/ID, ?id=ID, /folders/ID)
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      const fileMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (fileMatch && fileMatch[1]) {
        return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
      }
      const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      if (folderMatch && folderMatch[1]) {
        return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`;
      }
      return url.replace(/\/view.*$/, '/preview');
    }

    // 2. OneDrive / SharePoint / Teams
    if (url.includes('sharepoint.com') || url.includes('onedrive.live.com') || url.includes('1drv.ms') || url.includes('stream.office.com')) {
      // Links gerados pelo recurso "Inserir" (1drv.ms/v/c/CID/TOKEN)
      if (url.includes('1drv.ms/v/c/')) {
        return url;
      }

      // Se já for link embed oficial onedrive.live.com/embed
      if (url.includes('onedrive.live.com/embed')) {
        return url;
      }

      if (url.includes('onedrive.live.com')) {
        return url.replace('/view.aspx', '/embed').replace('/view', '/embed');
      }

      // SharePoint / Teams / OneDrive corporativo
      try {
        const parsed = new URL(url);
        if (!parsed.searchParams.has('action')) {
          parsed.searchParams.set('action', 'embedview');
        }
        return parsed.toString();
      } catch {
        return url.includes('?') ? `${url}&action=embedview` : `${url}?action=embedview`;
      }
    }

    // 3. YouTube (com suporte a shorts, watch?v=, youtu.be, embed)
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (url.includes('watch?v=')) {
        videoId = url.split('watch?v=')[1]?.split('&')[0] || '';
      } else if (url.includes('/embed/')) {
        videoId = url.split('/embed/')[1]?.split('?')[0] || '';
      } else if (url.includes('/shorts/')) {
        videoId = url.split('/shorts/')[1]?.split('?')[0] || '';
      }
      if (videoId) {
        return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;
      }
    }

    // 4. Vimeo
    if (url.includes('vimeo.com/')) {
      const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0] || '';
      if (vimeoId) {
        return `https://player.vimeo.com/video/${vimeoId}?dnt=1&autoplay=1`;
      }
    }

    // 5. Loom
    if (url.includes('loom.com/share/')) {
      const loomId = url.split('loom.com/share/')[1]?.split('?')[0] || '';
      if (loomId) {
        return `https://www.loom.com/embed/${loomId}`;
      }
    }

    return url;
  };

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm.trim() || (
        v.title.toLowerCase().includes(term) ||
        v.category.toLowerCase().includes(term) ||
        (v.moduleTopic && v.moduleTopic.toLowerCase().includes(term)) ||
        (v.addedBy && v.addedBy.toLowerCase().includes(term))
      );

      const matchesSector = selectedSectorFilter === 'Todos' || v.category === selectedSectorFilter;

      return matchesSearch && matchesSector;
    });
  }, [searchTerm, videos, selectedSectorFilter]);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-in fade-in slide-in-from-right-4 duration-300">
      
        {/* Header com Design Corporativo Grupo Medic */}
        <div className="bg-gradient-to-r from-[#0d1522] via-[#142136] to-[#0d1522] text-white px-6 py-4.5 flex items-center justify-between shrink-0 rounded-t-[24px] border-b border-slate-800/80 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-gradient-to-br from-[#121d2b] via-[#1b497d] to-[#17a398] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-950/40 ring-1 ring-white/15 shrink-0">
              <VideoIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  CAPACITAÇÃO
                </span>
                <h2 className="text-lg font-extrabold text-white tracking-tight">
                  Catálogo de Treinamentos
                </h2>
              </div>
              <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-2">
                <span>Capacitação e integração de equipes</span>
                <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                <span className="text-slate-300 font-semibold">{videos.length} treinamentos disponíveis</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {isLeader && (
              <button
                type="button"
                onClick={() => setShowLogsMode(!showLogsMode)}
                style={showLogsMode ? { backgroundColor: '#f59e0b', color: '#451a03' } : undefined}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  showLogsMode 
                    ? 'bg-amber-500 text-amber-950 shadow-amber-500/20 hover:bg-amber-400' 
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 backdrop-blur-md'
                }`}
              >
                <Users size={15} />
                <span>{showLogsMode ? 'Voltar aos Treinamentos' : 'Ver Acessos'}</span>
              </button>
            )}
            <button 
              type="button"
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white cursor-pointer active:scale-95"
              title="Fechar (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          
          {showLogsMode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <Users className="text-amber-500" />
                  Histórico de Acessos
                </h3>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Colaborador</th>
                      <th className="p-4">Setor</th>
                      <th className="p-4">Vídeo Acessado</th>
                      <th className="p-4">Data e Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accessLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                          Nenhum acesso registrado ainda.
                        </td>
                      </tr>
                    ) : (
                      accessLogs.map(log => {
                        const video = videos.find(v => v.id === log.videoId);
                        return (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-700">{log.userName}</td>
                            <td className="p-4 text-slate-600 font-medium">{log.userSector}</td>
                            <td className="p-4 text-slate-700">{video?.title || 'Vídeo excluído'}</td>
                            <td className="p-4 text-slate-500 font-medium">{new Date(log.accessedAt).toLocaleString('pt-BR')}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <>
              {/* Toolbar: Search + Sector Pills + Add Button */}
              <div className="space-y-4 mb-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar por título, setor, módulo ou instrutor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium shadow-sm"
                    />
                    {searchTerm && (
                      <button 
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleStartCreate}
                    style={{ backgroundColor: '#1f29de', color: '#ffffff' }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#1f29de] hover:bg-[#1a22b8] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30 cursor-pointer hover:shadow-lg active:scale-[0.98]"
                  >
                    <Plus size={18} className="text-white shrink-0" />
                    <span className="text-white whitespace-nowrap">Adicionar Treinamento</span>
                  </button>
                </div>

                {/* Sector Quick Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-400 shrink-0 pr-1">
                    <Filter size={13} />
                    <span>Setor:</span>
                  </div>
                  {['Todos', ...SETORES_TREINAMENTO].map(sec => {
                    const isSelected = selectedSectorFilter === sec;
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSelectedSectorFilter(sec)}
                        style={
                          isSelected
                            ? { backgroundColor: '#1f29de', color: '#ffffff' }
                            : { backgroundColor: '#ffffff', color: '#475569' }
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1f29de] text-white shadow-sm shadow-blue-600/30'
                            : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/90 shadow-2xs hover:border-slate-300'
                        }`}
                      >
                        {sec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Editing Form */}
              {isEditing && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 animate-in fade-in slide-in-from-top-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                      {editingVideo.id ? <Edit size={16} /> : <Plus size={16} />}
                      {editingVideo.id ? 'Editar Treinamento' : 'Novo Treinamento'}
                    </h3>

                    {autoDetected && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-full animate-bounce">
                        <Sparkles size={14} className="text-emerald-600" />
                        Informações preenchidas automaticamente!
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Link do Vídeo com Auto-Preenchimento */}
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
                            <LinkIcon size={14} className="text-blue-600" />
                            Link da Gravação (Google Drive, OneDrive, Teams, YouTube) *
                          </label>
                          {editingVideo.driveLink && getProviderInfo(editingVideo.driveLink) && (
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${getProviderInfo(editingVideo.driveLink)?.color}`}>
                              {getProviderInfo(editingVideo.driveLink)?.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isExtracting && (
                            <span className="text-[11px] text-blue-600 font-bold animate-pulse flex items-center gap-1">
                              <Sparkles size={12} />
                              Analisando gravação...
                            </span>
                          )}
                          {editingVideo.driveLink && (
                            <a
                              href={editingVideo.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-blue-200 shadow-xs"
                              title="Testar abertura do link em nova guia"
                            >
                              <ExternalLink size={11} />
                              Testar Link
                            </a>
                          )}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={editingVideo.driveLink || ''}
                        onChange={e => {
                          const val = sanitizeVideoUrl(e.target.value);
                          setEditingVideo(prev => ({ ...prev, driveLink: val }));
                          autoFillFromLink(val);
                        }}
                        onPaste={e => {
                          const pasted = e.clipboardData.getData('text');
                          if (pasted) {
                            const cleaned = sanitizeVideoUrl(pasted);
                            setEditingVideo(prev => ({ ...prev, driveLink: cleaned }));
                            autoFillFromLink(cleaned);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                        placeholder="Cole aqui o link compartilhado do Google Drive, OneDrive, Teams, YouTube ou arquivo direto..."
                      />

                      {/* Guia Rápido de Compartilhamento do Google Drive / OneDrive */}
                      <div className="mt-2 p-2.5 bg-blue-100/60 border border-blue-200/80 rounded-lg text-[11px] text-blue-900 space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-blue-950">
                          <Info size={13} className="text-blue-600 shrink-0" />
                          Como garantir que qualquer pessoa acerte o acesso:
                        </p>
                        <p className="text-slate-700 pl-4.5 leading-relaxed">
                          • <strong>Google Drive:</strong> No arquivo, clique em <em>Compartilhar</em> &gt; em <em>Acesso geral</em> selecione <strong>Qualquer pessoa com o link</strong> (como Leitor) &gt; clique em <strong>Copiar link</strong>.
                        </p>
                        <p className="text-slate-700 pl-4.5 leading-relaxed">
                          • <strong>OneDrive / SharePoint:</strong> Clique em <em>Compartilhar</em> &gt; <em>Qualquer pessoa com o link</em> &gt; Copiar link.
                        </p>
                      </div>
                    </div>

                    {/* Título */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-blue-800 mb-1">Título do Treinamento *</label>
                      <input
                        type="text"
                        value={editingVideo.title || ''}
                        onChange={e => {
                          const newTitle = e.target.value;
                          const detected = detectCategoryFromText(newTitle);
                          setEditingVideo(prev => ({
                            ...prev,
                            title: newTitle,
                            category: (!prev.category || prev.category === 'Geral') && detected !== 'Geral' ? detected : (prev.category || 'Geral'),
                            description: (!prev.description || prev.description.startsWith('Gravação de capacitação'))
                              ? (newTitle.trim() ? `Gravação de capacitação e alinhamento operacional sobre ${newTitle.trim()}.` : '')
                              : prev.description
                          }));
                        }}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                        placeholder="Ex: Treinamento - Plataforma NAT SUIT e Portal do Fornecedor"
                      />
                    </div>

                    {/* Setor (Lista Suspensa) */}
                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1">Setor *</label>
                      <select
                        value={editingVideo.category || 'Geral'}
                        onChange={e => setEditingVideo(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-700 cursor-pointer"
                      >
                        {SETORES_TREINAMENTO.map(sec => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))}
                      </select>
                    </div>

                    {/* Módulo / Processo (Entrada Manual) */}
                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1">Módulo / Processo</label>
                      <input
                        type="text"
                        value={editingVideo.moduleTopic || ''}
                        onChange={e => setEditingVideo(prev => ({ ...prev, moduleTopic: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-700"
                        placeholder="Ex: Faturamento, Emissão de Propostas, Acessos..."
                      />
                    </div>

                    {/* Duração com Seletor Rápido e Detecção */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-blue-800">Duração do Treinamento *</label>
                        <span className="text-[10px] text-blue-600 font-bold">⏱️ 1-Clique ou Manual</span>
                      </div>
                      <input
                        type="text"
                        value={editingVideo.duration || ''}
                        onChange={e => setEditingVideo(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium mb-1.5"
                        placeholder="Ex: 45:00 ou 01:15:00"
                      />
                      <div className="flex flex-wrap items-center gap-1">
                        {['15:00', '30:00', '45:00', '50:00', '01:00:00', '01:30:00'].map(preset => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setEditingVideo(prev => ({ ...prev, duration: preset }))}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                              editingVideo.duration === preset
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-100'
                            }`}
                          >
                            {preset.startsWith('01:00') ? '1h' : preset.startsWith('01:30') ? '1h 30' : `${parseInt(preset)}m`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Instrutor / Responsável */}
                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1">Instrutor / Responsável *</label>
                      <input
                        type="text"
                        value={editingVideo.addedBy !== undefined ? editingVideo.addedBy : userName}
                        onChange={e => setEditingVideo(prev => ({ ...prev, addedBy: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                        placeholder="Digite o nome do instrutor ou responsável"
                      />
                    </div>

                    {/* Capa Personalizada (Opcional) */}
                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1 flex items-center gap-1">
                        <ImageIcon size={13} className="text-blue-600" />
                        <span>Capa do Vídeo (URL Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={editingVideo.thumbnailUrl || ''}
                        onChange={e => setEditingVideo(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="https://.../capa.jpg (ou gerada automaticamente)"
                      />
                    </div>

                    {/* Descrição */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-blue-800 mb-1">Descrição do Conteúdo</label>
                      <textarea
                        value={editingVideo.description || ''}
                        onChange={e => setEditingVideo(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Breve resumo dos tópicos abordados no treinamento..."
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-blue-200/80">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditingVideo({});
                      }}
                      className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-sm hover:bg-slate-200/60 rounded-xl cursor-pointer transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveVideo}
                      disabled={!editingVideo.driveLink?.trim()}
                      style={{ backgroundColor: '#1f29de', color: '#ffffff' }}
                      className="px-5 py-2.5 bg-[#1f29de] hover:bg-[#1a22b8] text-white font-bold text-sm rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-blue-600/30 hover:shadow-lg active:scale-[0.98]"
                    >
                      {editingVideo.id ? <Save size={18} className="text-white" /> : <Plus size={18} className="text-white" />}
                      <span>{editingVideo.id ? 'Salvar Alterações' : 'Adicionar Treinamento'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Grid of Videos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map(video => {
                  const effectiveThumb = getEffectiveThumbnail(video);
                  const theme = SECTOR_THEMES[video.category] || SECTOR_THEMES['Geral'];

                  return (
                    <div key={video.id} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-xl transition-all group flex flex-col">
                      
                      {/* Visual Cinematic Thumbnail */}
                      <div className="h-44 relative overflow-hidden flex flex-col justify-between border-b border-slate-700/80 group/card">
                        {effectiveThumb ? (
                          <>
                            <img
                              src={effectiveThumb}
                              alt={video.title}
                              className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-black/30" />
                          </>
                        ) : (
                          <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg}`}>
                            {/* Ambient Glows */}
                            <div className={`absolute -top-10 -right-10 w-36 h-36 rounded-full ${theme.glow} blur-2xl`} />
                            <div className={`absolute -bottom-10 -left-10 w-36 h-36 rounded-full ${theme.glow} blur-2xl opacity-60`} />

                            {/* Tech Grid Pattern overlay */}
                            <div 
                              className="absolute inset-0 opacity-[0.08]" 
                              style={{ 
                                backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
                                backgroundSize: '16px 16px' 
                              }} 
                            />

                            {/* Sector Watermark Badge in background */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.06] font-black text-6xl text-white tracking-widest uppercase">
                              {video.category?.split(' ')[0] || 'MEDIC'}
                            </div>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="relative z-10 p-3 flex flex-wrap items-center gap-1.5 max-w-[88%]">
                          <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-extrabold text-white tracking-wider shadow-sm border border-white/20 shrink-0">
                            {video.category || 'Geral'}
                          </div>
                          {video.moduleTopic && (
                            <div 
                              style={{ backgroundColor: '#1f29de' }}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white tracking-wider shadow-md border border-blue-400/40 truncate max-w-[140px]" 
                              title={video.moduleTopic}
                            >
                              {video.moduleTopic}
                            </div>
                          )}
                        </div>

                        {/* Bottom Info Bar: Duration */}
                        <div className="relative z-10 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-300 drop-shadow-sm truncate max-w-[65%]">
                            <Film size={12} className="text-teal-400 shrink-0" />
                            <span className="truncate">{video.moduleTopic || video.category}</span>
                          </div>
                          <div className="bg-black/75 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white flex items-center gap-1 border border-white/15 shadow-sm shrink-0">
                            <Clock size={11} className="text-slate-300" />
                            <span>{(video.duration && video.duration !== '00:00' && video.duration !== '0:00') ? video.duration : '45:00'}</span>
                          </div>
                        </div>

                        {/* Central Interactive Play Button Overlay */}
                        <button
                          type="button"
                          onClick={() => handlePlayVideo(video)}
                          className="absolute inset-0 bg-slate-950/20 hover:bg-slate-950/50 transition-all flex items-center justify-center cursor-pointer group/play z-20"
                        >
                          <div 
                            style={{ backgroundColor: '#1f29de' }}
                            className="w-13 h-13 rounded-full bg-[#1f29de] text-white flex items-center justify-center shadow-xl shadow-blue-900/60 ring-4 ring-white/20 group-hover/play:ring-white/40 group-hover/play:scale-115 transition-all duration-300 active:scale-95"
                          >
                            <Play size={22} className="text-white ml-0.5" fill="white" />
                          </div>
                        </button>
                      </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className="font-bold text-slate-800 leading-tight mb-2 line-clamp-2" title={video.title}>
                        {video.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1">
                        {video.description || 'Sem descrição.'}
                      </p>
                      
                      {/* Footer do Card */}
                      <div className="pt-3 border-t border-slate-100 flex items-end justify-between mt-auto">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Instrutor</p>
                          <p className="text-xs font-bold text-slate-700">{video.addedBy}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(video)}
                            className="px-2.5 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                            title="Editar Treinamento"
                          >
                            <Edit size={14} />
                            <span>Editar</span>
                          </button>
                          {(isLeader || video.addedBy === userName) && (
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
                
                {filteredVideos.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-2xl border-dashed">
                    <VideoIcon size={48} className="mx-auto text-slate-300 mb-3" />
                    <h4 className="text-slate-500 font-bold mb-1">Nenhum treinamento encontrado</h4>
                    <p className="text-slate-400 text-sm">Verifique a pesquisa ou adicione novos vídeos.</p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      

      {/* Video Player Modal 100% Integrado & Protegido */}
      {playingVideo && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex flex-col select-none animate-in fade-in duration-200"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Player Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/95 via-black/80 to-transparent z-10 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Play size={18} fill="currentColor" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base md:text-lg flex items-center gap-2 flex-wrap">
                  <span className="line-clamp-1">{playingVideo.title}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 shrink-0">
                    {playingVideo.category || 'Geral'}
                  </span>
                  {playingVideo.moduleTopic && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shrink-0">
                      {playingVideo.moduleTopic}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Adicionado por {playingVideo.addedBy}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    🔒 Reprodução Corporativa
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setPlayingVideo(null)}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Fechar (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Player Embed Frame */}
          <div className="flex-1 w-full h-full p-2 md:p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-800/80 relative flex items-center justify-center">
              
              {/* Spinner animado enquanto o player carrega */}
              {isPlayerLoading && (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-3.5 z-10 animate-in fade-in duration-150">
                  <div className="relative flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-3 border-blue-500/20 border-t-blue-500 animate-spin" />
                    <Play size={18} className="absolute text-blue-400 fill-blue-400 ml-0.5 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-bold tracking-tight">Carregando treinamento...</p>
                    <p className="text-slate-400 text-xs mt-0.5 font-medium">Iniciando reprodutor seguro</p>
                  </div>
                </div>
              )}

              {isDirectVideoFile(playingVideo.driveLink) ? (
                <video
                  src={playingVideo.driveLink}
                  controls
                  autoPlay
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  onLoadedData={() => setIsPlayerLoading(false)}
                  onLoadedMetadata={(e) => {
                    setIsPlayerLoading(false);
                    if (e.currentTarget.duration && e.currentTarget.duration > 0) {
                      const exact = formatDuration(e.currentTarget.duration);
                      updateVideoDuration(playingVideo.id, exact);
                    }
                  }}
                  className="w-full h-full object-contain"
                >
                  Seu navegador não suporta a tag de vídeo.
                </video>
              ) : (
                <iframe
                  src={getEmbedUrl(playingVideo.driveLink)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="eager"
                  onLoad={() => setIsPlayerLoading(false)}
                  title={playingVideo.title}
                ></iframe>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


