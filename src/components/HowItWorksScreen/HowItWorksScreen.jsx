import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Sparkles, Layers, BookOpen, Brain, Star, Save, Recycle, Package, CupSoda, Smartphone, Scissors, Shirt } from 'lucide-react';
import './HowItWorksScreen.css';

const steps = [
  {
    step: '01',
    icon: Camera,
    title: 'Scan Your Waste',
    desc: 'Open the scanner and point your camera at any recyclable item. Our AI instantly identifies what it is.',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.2)',
  },
  {
    step: '02',
    icon: Brain,
    title: 'AI Recognition',
    desc: 'TensorFlow.js runs entirely in your browser — no server needed. Detection happens in under 2 seconds.',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.2)',
  },
  {
    step: '03',
    icon: Sparkles,
    title: 'See AR Visualization',
    desc: 'Watch a 3D model appear showing what your item could become — a plant pot, pencil holder, and more!',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.2)',
  },
  {
    step: '04',
    icon: BookOpen,
    title: 'Follow the Steps',
    desc: 'Get detailed, easy-to-follow instructions. Check off each step and track your progress. Voice narration available!',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
  },
  {
    step: '05',
    icon: Save,
    title: 'Save & Share',
    desc: 'Save your favorite ideas and share your creations with the eco-community. Inspire others!',
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.08)',
    border: 'rgba(244,114,182,0.2)',
  },
];

const detectedItems = [
  { icon: Package, label: 'Bottle', result: 'Plant Pot' },
  { icon: Scissors, label: 'Tin Can', result: 'Lantern' },
  { icon: BookOpen, label: 'Books', result: 'Paper Beads' },
  { icon: Shirt, label: 'T-Shirt', result: 'Tote Bag' },
  { icon: Smartphone, label: 'Phone', result: 'E-Recycle' },
  { icon: CupSoda, label: 'Cup', result: 'Organizer' },
];

const HowItWorksScreen = ({ onBack, onStartScanning }) => {
  return (
    <div className="how-screen">
      <div className="how-bg-texture">
        <img src="/eco_card_texture.png" alt="" />
      </div>

      {/* Header */}
      <motion.div
        className="how-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="how-back-btn" id="btn-how-back" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="how-title">How It Works</h1>
          <p className="how-subtitle">5 simple steps to transform waste</p>
        </div>
      </motion.div>

      <div className="how-content scroll-area">
        {/* Hero Banner */}
        <motion.div
          className="how-hero"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="how-hero-icon">
            <Recycle size={32} />
          </div>
          <div className="how-hero-text">
            <h2>Turn Trash into Treasure</h2>
            <p>AI-powered recycling ideas, instantly in AR</p>
          </div>
        </motion.div>

        {/* Detected Items Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="section-label">Items we can detect</p>
          <div className="detected-items-row">
            {detectedItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  className="detected-item-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                >
                  <span className="detected-icon-wrap"><Icon size={14} /></span>
                  <span className="detected-label">{item.label}</span>
                  <span className="detected-arrow">→</span>
                  <span className="detected-result">{item.result}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Steps */}
        <div className="how-steps">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            return (
              <motion.div
                key={step.step}
                className="how-step-card"
                style={{
                  background: step.bg,
                  borderColor: step.border,
                }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
              >
                <div className="how-step-left">
                  <div className="how-step-num" style={{ color: step.color, borderColor: step.border }}>
                    {step.step}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="how-step-line" style={{ background: step.border }} />
                  )}
                </div>
                <div className="how-step-body">
                  <div className="how-step-icon" style={{ color: step.color }}>
                    <StepIcon size={24} />
                  </div>
                  <div>
                    <h3 className="how-step-title" style={{ color: step.color }}>{step.title}</h3>
                    <p className="how-step-desc">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tech Stack Note */}
        <motion.div
          className="tech-note"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <div className="tech-note-header">
            <Layers size={16} />
            <span>Powered By</span>
          </div>
          <div className="tech-tags">
            {['TensorFlow.js', 'COCO-SSD', 'React Three Fiber', 'WebXR', 'Web Speech API'].map(t => (
              <span key={t} className="tech-tag">{t}</span>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          className="btn btn-primary how-cta"
          id="btn-how-start-scanning"
          onClick={onStartScanning}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Camera size={20} />
          Start Scanning Now
        </motion.button>
        
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
};

export default HowItWorksScreen;
