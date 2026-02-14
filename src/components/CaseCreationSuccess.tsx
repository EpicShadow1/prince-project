import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  FileText, 
  Calendar, 
  User, 
  Hash, 
  X, 
  Sparkles, 
  Copy,
  Check,
  Gavel,
  Scale,
  Clock
} from 'lucide-react';
import { Case } from '../contexts/CasesContext';

interface CaseCreationSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: Case | null;
  isLawyer: boolean;
}

export function CaseCreationSuccess({ isOpen, onClose, caseData, isLawyer }: CaseCreationSuccessProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(100);

  // Handle close callback - defined before useEffect to avoid dependency issues
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setShowConfetti(false);
    }, 400);
  }, [onClose]);

  // Handle keyboard events (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setShowConfetti(true);
      setProgress(100);
      setCopied(false);
      
      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(progressInterval);
            return 0;
          }
          return prev - 0.5; // Decrease by 0.5% every 25ms = 5 seconds total
        });
      }, 25);

      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose();
          setShowConfetti(false);
        }, 400);
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [isOpen, onClose]);

  const handleCopyCaseNumber = useCallback(() => {
    if (caseData?.id) {
      navigator.clipboard.writeText(caseData.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [caseData?.id]);

  const handleViewCase = useCallback(() => {
    handleClose();
    if (caseData?.id) {
      // Small delay to let modal close first
      setTimeout(() => {
        navigate(`/cases/${caseData.id}`);
      }, 300);
    }
  }, [handleClose, navigate, caseData?.id]);

  if (!isOpen || !caseData) return null;

  // Get case type icon and color
  const getCaseTypeConfig = (type: string) => {
    const configs: Record<string, { icon: React.ReactNode; color: string; bgColor: string; borderColor: string }> = {
      Criminal: {
        icon: <Gavel className="h-5 w-5" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      Civil: {
        icon: <Scale className="h-5 w-5" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      Family: {
        icon: <User className="h-5 w-5" />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200'
      },
      Commercial: {
        icon: <FileText className="h-5 w-5" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      Appeal: {
        icon: <Clock className="h-5 w-5" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200'
      }
    };
    return configs[type] || configs.Civil;
  };

  const typeConfig = getCaseTypeConfig(caseData.type);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Animated Backdrop with gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80 backdrop-blur-md transition-all duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Enhanced Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Primary confetti - Sparkles */}
          {[...Array(30)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute animate-confetti-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-30px',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              <Sparkles 
                className={`h-4 w-4 sm:h-6 sm:w-6 ${
                  ['text-yellow-400', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-pink-400', 'text-cyan-400'][i % 6]
                }`}
                style={{
                  filter: 'drop-shadow(0 0 6px currentColor)',
                }}
              />
            </div>
          ))}
          
          {/* Secondary confetti - Circles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={`circle-${i}`}
              className="absolute animate-confetti-fall-slow"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${4 + Math.random() * 3}s`,
              }}
            >
              <div 
                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                  ['bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400'][i % 5]
                }`}
                style={{
                  boxShadow: '0 0 10px currentColor',
                  opacity: 0.8,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Main Success Card */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-500 ${
          isVisible 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 opacity-20 blur-sm" />
        
        {/* Success Header with Icon */}
        <div className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-6 py-8 text-center border-b border-green-100">
          {/* Animated success circle */}
          <div className="relative mx-auto mb-4">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-2 bg-emerald-400 rounded-full animate-pulse opacity-30" />
            <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-4 shadow-lg shadow-green-500/30">
              <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-white animate-success-bounce" />
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            {isLawyer ? 'Case Submitted!' : 'Case Created!'}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            {isLawyer 
              ? 'Your case has been submitted for approval.' 
              : 'The case has been successfully registered in the system.'}
          </p>
        </div>

        {/* Case Details Card */}
        <div className="px-6 py-6">
          <div className={`bg-gradient-to-br ${typeConfig.bgColor} to-white rounded-2xl p-5 border-2 ${typeConfig.borderColor} shadow-sm`}>
            {/* Case Number with Copy Button */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${typeConfig.bgColor} ${typeConfig.color}`}>
                  <Hash className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Case Number</p>
                  <p className="text-lg font-bold text-slate-800 font-mono">{caseData.id}</p>
                </div>
              </div>
              <button
                onClick={handleCopyCaseNumber}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  copied 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800'
                }`}
                title="Copy case number"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            {/* Case Title */}
            <div className="mb-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Case Title</p>
              <p className="text-base sm:text-lg font-semibold text-slate-800 leading-tight">{caseData.title}</p>
            </div>

            {/* Grid of Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${typeConfig.bgColor} ${typeConfig.color}`}>
                  {typeConfig.icon}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Type</p>
                  <p className={`text-sm font-semibold ${typeConfig.color}`}>{caseData.type}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Next Hearing</p>
                  <p className="text-sm font-semibold text-slate-700">{caseData.nextHearing}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Days Left</p>
                  <p className="text-sm font-semibold text-slate-700">{caseData.daysLeft} days</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${
                  caseData.status === 'Pending Approval' 
                    ? 'bg-amber-50 text-amber-600' 
                    : 'bg-green-50 text-green-600'
                }`}>
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    caseData.status === 'Pending Approval' 
                      ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                      : 'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {caseData.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-200 hover:shadow-md"
          >
            Close
          </button>
          <button
            onClick={handleViewCase}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            View Case Details
          </button>
        </div>

        {/* Close X button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-full transition-all duration-200 group"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
        </button>

        {/* Animated Progress bar for auto-close */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* CSS Animations - Cross-browser compatible */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }
        
        @keyframes confetti-fall-slow {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes success-bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        .animate-confetti-fall {
          animation: confetti-fall linear forwards;
          will-change: transform, opacity;
        }
        
        .animate-confetti-fall-slow {
          animation: confetti-fall-slow linear forwards;
          will-change: transform, opacity;
        }
        
        .animate-success-bounce {
          animation: success-bounce 2s ease-in-out infinite;
        }
        
        /* Ensure smooth animations in all browsers */
        @media (prefers-reduced-motion: reduce) {
          .animate-confetti-fall,
          .animate-confetti-fall-slow,
          .animate-success-bounce {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
