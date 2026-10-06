import React, { useState, useEffect, useMemo } from 'react';
import { X, Play, Plus, Edit, Trash2, Search, Video as VideoIcon, Clock, Link as LinkIcon, Save, Eye, Users } from 'lucide-react';
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
  category: string;
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

const DEFAULT_VIDEOS: Video[] = [
  {
    id: 'v1',
    title: 'Integração de Novos Colaboradores 2026',
    description: 'Tudo o que você precisa saber para o seu primeiro dia. Conheça nossa cultura, nossos sistemas e as regras gerais da empresa.',
    duration: '45:20',
    driveLink: 'https://drive.google.com/file/d/1_EXEMPLO_ID_AQUI/preview',
    category: 'Integração',
    addedBy: 'T.I',
    addedAt: new Date().toISOString()
  }
];

export const CatalogoVideosModal: React.FC<CatalogoVideosModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Partial<Video>>({});
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  
  const [showLogsMode, setShowLogsMode] = useState(false);

  const userName = localStorage.getItem('userName') || 'Usuário';
  const userSector = localStorage.getItem('userSector') || '';
  const userLevel = localStorage.getItem('userLevel') || '';

  const normalizedSector = userSector.toLowerCase();
  const isTiOrOps = normalizedSector.includes('ti') || normalizedSector.includes('tecnologia') || normalizedSector.includes('operaç') || normalizedSector.includes('operac');
  const isGestor = normalizedSector.includes('gestor') || normalizedSector.includes('diretor') || userLevel === 'coo';

  // Apenas líderes de T.I, Operações ou o Gestor Geral têm acesso para ver logs, editar ou excluir.
  const isLeader = isTiOrOps || isGestor;

  useEffect(() => {
    const storedVideos = localStorage.getItem('treinaflix_videos');
    if (storedVideos) {
      setVideos(JSON.parse(storedVideos));
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

  const handleSaveVideo = () => {
    if (!editingVideo.title || !editingVideo.driveLink) return;

    if (editingVideo.id) {
      // Edit
      saveVideos(videos.map(v => v.id === editingVideo.id ? { ...v, ...editingVideo } as Video : v));
    } else {
      // Create
      const newVideo: Video = {
        id: Date.now().toString(),
        title: editingVideo.title,
        description: editingVideo.description || '',
        duration: editingVideo.duration || '00:00',
        driveLink: editingVideo.driveLink,
        category: editingVideo.category || 'Geral',
        addedBy: userName,
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

  const getEmbedUrl = (url: string) => {
    if (url.includes('drive.google.com/file/d/')) {
      return url.replace('/view', '/preview').split('?usp')[0];
    }
    return url;
  };

  const filteredVideos = useMemo(() => {
    if (!searchTerm.trim()) return videos;
    return videos.filter(
      (v) =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, videos]);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-in fade-in slide-in-from-right-4 duration-300">
      
        {/* Header */}
        <div className="bg-[#1a2332] text-white px-6 py-4 flex items-center justify-between shrink-0 rounded-t-[20px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <VideoIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Catálogo de Treinamentos</h2>
              <p className="text-slate-300 text-xs">Plataforma de capacitação e integração</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isLeader && (
              <button
                onClick={() => setShowLogsMode(!showLogsMode)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                style={showLogsMode 
                  ? { backgroundColor: '#f59e0b', color: '#451a03' } 
                  : { backgroundColor: '#334155', color: '#f8fafc' }}
              >
                <Users size={16} />
                {showLogsMode ? 'Voltar aos Vídeos' : 'Ver Acessos'}
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white">
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
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
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
                          <tr key={log.id} className="hover:bg-slate-50/50">
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
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar treinamentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium shadow-sm"
                  />
                </div>
                {isLeader && (
                  <button
                    onClick={() => {
                      setEditingVideo({});
                      setIsEditing(true);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                    style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                  >
                    <Plus size={18} />
                    Adicionar Treinamento
                  </button>
                )}
              </div>

              {/* Editing Form */}
              {isEditing && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                    {editingVideo.id ? <Edit size={16} /> : <Plus size={16} />}
                    {editingVideo.id ? 'Editar Treinamento' : 'Novo Treinamento'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1">Título do Treinamento *</label>
                      <input
                        type="text"
                        value={editingVideo.title || ''}
                        onChange={e => setEditingVideo({ ...editingVideo, title: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm"
                        placeholder="Ex: Integração GOP"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1">Link do Google Drive *</label>
                      <input
                        type="text"
                        value={editingVideo.driveLink || ''}
                        onChange={e => setEditingVideo({ ...editingVideo, driveLink: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm"
                        placeholder="Link de compartilhamento"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1">Categoria</label>
                      <input
                        type="text"
                        value={editingVideo.category || ''}
                        onChange={e => setEditingVideo({ ...editingVideo, category: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm"
                        placeholder="Ex: Sistemas"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1">Duração (Opcional)</label>
                      <input
                        type="text"
                        value={editingVideo.duration || ''}
                        onChange={e => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm"
                        placeholder="Ex: 15:30"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-blue-800 mb-1">Descrição</label>
                      <textarea
                        value={editingVideo.description || ''}
                        onChange={e => setEditingVideo({ ...editingVideo, description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-blue-200">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-blue-700 font-bold text-sm hover:bg-blue-100 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveVideo}
                      disabled={!editingVideo.title || !editingVideo.driveLink}
                      className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save size={16} />
                      Salvar Treinamento
                    </button>
                  </div>
                </div>
              )}

              {/* Grid of Videos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map(video => (
                  <div key={video.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all group flex flex-col">
                    
                    {/* Fake Thumbnail */}
                    <div className="h-36 bg-gradient-to-br from-[#1a2332] to-slate-800 border-b border-slate-700 relative flex flex-col items-center justify-center">
                      <VideoIcon size={36} className="text-slate-600 mb-2" />
                      <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-extrabold text-white tracking-wider shadow-sm border border-white/20">
                        {video.category}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1">
                        <Clock size={12} />
                        {video.duration}
                      </div>
                      
                      {/* Play Overlay */}
                      <button
                        onClick={() => handlePlayVideo(video)}
                        className="absolute inset-0 bg-slate-900/10 hover:bg-slate-900/50 transition-all flex items-center justify-center cursor-pointer group/play"
                      >
                        <div className="w-14 h-14 bg-white/20 group-hover/play:bg-blue-600/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-lg border border-white/30 group-hover/play:border-blue-500 group-hover/play:scale-110">
                          <Play size={24} className="text-white ml-1" fill="white" />
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
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Adicionado por</p>
                          <p className="text-xs font-bold text-slate-700">{video.addedBy}</p>
                        </div>
                        {isLeader && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingVideo(video);
                                setIsEditing(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
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
      

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <h3 className="text-white font-bold text-lg">{playingVideo.title}</h3>
            <button
              onClick={() => setPlayingVideo(null)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 w-full h-full p-4 md:p-8 flex items-center justify-center">
            <iframe
              src={getEmbedUrl(playingVideo.driveLink)}
              className="w-full max-w-5xl aspect-video rounded-xl shadow-2xl bg-slate-900 border border-slate-800"
              allow="autoplay"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

    </div>
  );
};
