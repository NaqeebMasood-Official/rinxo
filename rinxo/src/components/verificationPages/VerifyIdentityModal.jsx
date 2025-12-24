import React, { useState } from "react";
import { X, UploadCloud } from "lucide-react";

export default function VerifyIdentityModal({
  // isOpen,
  setModalOpen,
}) {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (type === "front") setFrontImage(reader.result);
      else setBackImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!frontImage || !backImage) {
      alert("Please upload both CNIC front and back images.");
      return;
    }
    alert("Identity submitted successfully!");
    setModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Verify Identity</h2>
          <button
            onClick={() => setModalOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Please upload a clear image of your CNIC front and back.
          </p>

          {/* CNIC Front */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CNIC Front
            </label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-yellow-400 transition">
              {frontImage ? (
                <img
                  src={frontImage}
                  alt="Front CNIC"
                  className="w-full h-40 object-contain rounded"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <UploadCloud size={32} />
                  <span className="text-sm">Click to upload front image</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className={`w-full h-16 ${
                  frontImage && "h-52"
                } absolute opacity-0 cursor-pointer`}
                onChange={(e) => handleFileChange(e, "front")}
              />
            </div>
          </div>

          {/* CNIC Back */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CNIC Back
            </label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-yellow-400 transition">
              {backImage ? (
                <img
                  src={backImage}
                  alt="Back CNIC"
                  className="w-full h-40 object-contain rounded"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <UploadCloud size={32} />
                  <span className="text-sm">Click to upload back image</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className={`w-full h-16 ${
                  backImage && "h-52"
                } absolute opacity-0 cursor-pointer`}
                onChange={(e) => handleFileChange(e, "back")}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-2 rounded-lg transition"
            >
              Submit
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
