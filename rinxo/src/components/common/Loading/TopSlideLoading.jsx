 
export default function TopSlideLoading({ show }) {
  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50 overflow-hidden">
      <div className="h-1 bg-yellow-400 animate-slide"></div>

      <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        .animate-slide {
          width: 30%; /* Width of the sliding bar */
          animation: slide 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
