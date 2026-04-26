import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, VolumeX, CheckCircle2, Star, Wrench, Scissors, Palette, Droplet, Leaf, Check, Ruler, Link, Link2, Sparkles, Tag, ShoppingCart, ListChecks, Share2 } from 'lucide-react';
import './InstructionsScreen.css';

const stepIcons = [Wrench, Scissors, Palette, Droplet, Leaf, Check, Ruler, Link, Link2, Sparkles];

const InstructionsScreen = ({ ideaData, onBack, onSave, isSaved }) => {
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [voiceOn, setVoiceOn] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const { idea, objectData } = ideaData;

  const toggleStep = (index) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const progress = idea?.steps ? (completedSteps.size / idea.steps.length) * 100 : 0;

  const handleVoice = () => {
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setVoiceOn(false);
      return;
    }
    setVoiceOn(true);
    setSpeaking(true);
    const text = `${idea?.title}. ${idea?.description}. Steps: ${idea?.steps?.join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => { setSpeaking(false); setVoiceOn(false); };
    window.speechSynthesis.speak(utterance);
  };

  const shareText = `🌿 I just completed a Trash2Treasure project!\n\n📦 "${idea?.title}"\n${idea?.description}\n\n♻️ Materials: ${idea?.materials?.join(', ')}\n\nTurn your trash into treasure too! #Trash2Treasure #Upcycling`;
  const shareUrl = window.location.href;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareOptions = [
    { name: 'Facebook', color: '#1877F2', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    ), url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}` },
    { name: 'Messenger', color: '#0099FF', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 4.97 0 11.11c0 3.5 1.74 6.62 4.47 8.65V24l4.09-2.24c1.09.3 2.24.46 3.44.46 6.63 0 12-4.97 12-11.11S18.63 0 12 0zm1.19 14.96l-3.06-3.26-5.97 3.26L10.3 8.83l3.14 3.26 5.89-3.26-6.14 6.13z"/></svg>
    ), url: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=&redirect_uri=${encodedUrl}` },
    { name: 'WhatsApp', color: '#25D366', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    ), url: `https://wa.me/?text=${encodedText}` },
    { name: 'Twitter / X', color: '#000000', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    ), url: `https://twitter.com/intent/tweet?text=${encodedText}` },
    { name: 'Telegram', color: '#0088CC', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
    ), url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setShareCopied(true);
      setTimeout(() => { setShareCopied(false); setShowShareModal(false); }, 1500);
    });
  };


  return (
    <div className="instructions-screen">
      <div className="instr-bg-texture">
        <img src="/eco_card_texture.png" alt="" />
      </div>

      {/* Header */}
      <motion.div
        className="instructions-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="instr-back-btn" id="btn-instructions-back" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="instr-title-area">
          <span className="instr-object-tag">
            <Tag size={12} style={{ marginRight: 4 }} /> {objectData?.label}
          </span>
          <h1 className="instr-title">{idea?.title}</h1>
        </div>
        <div className="instr-header-actions">
          <button
            className={`instr-icon-btn ${voiceOn ? 'active' : ''}`}
            id="btn-voice-toggle"
            onClick={handleVoice}
          >
            {voiceOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            className={`instr-icon-btn ${isSaved(idea?.id) ? 'saved' : ''}`}
            id="btn-instr-save"
            onClick={() => onSave(idea, objectData)}
          >
            <Star size={18} fill={isSaved(idea?.id) ? 'currentColor' : 'none'} />
          </button>
        </div>
      </motion.div>

      <div className="instructions-content scroll-area">
        {/* Info Cards */}
        <motion.div
          className="instr-info-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={`badge badge-${idea?.difficulty?.toLowerCase()} instr-badge`}>
            {idea?.difficulty}
          </div>
          <div className="instr-info-pill">⏱ {idea?.time}</div>
          <div className="instr-info-pill"><Leaf size={12} style={{ marginRight: 4 }} /> {idea?.impact || 'Medium'} Impact</div>
        </motion.div>

        {/* Description */}
        <motion.p
          className="instr-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {idea?.description}
        </motion.p>

        {/* Progress */}
        <motion.div
          className="progress-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="progress-header">
            <span className="progress-label">Progress</span>
            <span className="progress-count">{completedSteps.size}/{idea?.steps?.length} steps</span>
          </div>
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Materials */}
        <motion.div
          className="materials-section"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="section-heading">
            <ShoppingCart size={18} /> Materials Needed
          </h3>
          <div className="materials-grid">
            {idea?.materials?.map((mat, i) => (
              <div key={i} className="material-chip">
                <span className="material-dot" />
                {mat}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="steps-section"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h3 className="section-heading">
            <ListChecks size={18} /> Step-by-Step Guide
          </h3>
          <div className="steps-list">
            {idea?.steps?.map((step, index) => {
              const StepIcon = stepIcons[index % stepIcons.length];
              return (
                <motion.div
                  key={index}
                  className={`step-item ${completedSteps.has(index) ? 'completed' : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.06 }}
                  onClick={() => toggleStep(index)}
                >
                  <div className="step-left">
                    <div className="step-number">
                      {completedSteps.has(index) ? (
                        <CheckCircle2 size={22} className="step-check" />
                      ) : (
                        <span className="step-num-text">{index + 1}</span>
                      )}
                    </div>
                    {index < idea.steps.length - 1 && <div className="step-connector" />}
                  </div>
                  <div className="step-body">
                    <div className="step-icon-wrap">
                      <StepIcon size={16} />
                    </div>
                    <p className="step-text">{step}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Completion */}
        <AnimatePresence>
          {progress === 100 && (
            <motion.div
              className="completion-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3 className="completion-title">Amazing work!</h3>
              <p className="completion-desc">You've turned waste into treasure. Share your creation with the community!</p>
              <button className="btn btn-primary" id="btn-share-creation" style={{ marginTop: 16 }} onClick={() => setShowShareModal(true)}>
                <Share2 size={16} style={{ marginRight: 8 }} />
                Share Creation
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <>
              <motion.div
                className="share-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowShareModal(false)}
              />
              <motion.div
                className="share-modal"
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 80 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <div className="share-modal-handle" />
                <h3 className="share-modal-title">Share your creation</h3>
                <p className="share-modal-sub">Let the world know you turned trash into treasure!</p>
                <div className="share-grid">
                  {shareOptions.map((opt) => (
                    <a
                      key={opt.name}
                      href={opt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="share-option"
                      onClick={() => setTimeout(() => setShowShareModal(false), 300)}
                    >
                      <div className="share-option-icon" style={{ background: opt.color, color: '#fff' }}>
                        {opt.icon}
                      </div>
                      <span className="share-option-name">{opt.name}</span>
                    </a>
                  ))}
                  <button className="share-option" onClick={handleCopyLink}>
                    <div className="share-option-icon" style={{ background: '#6b7280', color: '#fff' }}>
                      <Link2 size={22} />
                    </div>
                    <span className="share-option-name">{shareCopied ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
};

export default InstructionsScreen;
