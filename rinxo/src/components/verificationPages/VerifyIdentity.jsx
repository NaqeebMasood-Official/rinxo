import React from 'react'

import VerifyIdentityModal from "./VerifyIdentityModal";
export default function VerifyIdentity({showWarning,setShowWarning,setModalOpen,modalOpen}) {
    const handleConfirmVerify = () => {
    setShowWarning(false); // hide warning
    setModalOpen(true); // open modal
  };
  return (
    <>
     {/* Warning Popup */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
              Verify Identity
            </h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Please verify your identity by uploading your CNIC front and back
              images.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirmVerify}
                className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowWarning(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Identity Modal */}
      {modalOpen && (
        <VerifyIdentityModal
          setModalOpen={setModalOpen}
        />
      )}
    </>
  )
}
