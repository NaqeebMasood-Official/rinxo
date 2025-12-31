import { useState } from "react";
import { X, UploadCloud } from "lucide-react";
import { toast } from "react-toastify";

export default function VerifyIdentityModal({
  setActiveSubMenu,
  setModalOpen,
}) {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    if (type === "front") {
      setFrontImage(file);
    } else {
      setBackImage(file);
    }
  };

  const handleSubmit = async () => {
    if (!frontImage || !backImage) {
      toast.error("Please upload both CNIC front and back images.");
      return;
    }

    const formData = new FormData();
    formData.append("frontImage", frontImage);
    formData.append("backImage", backImage);

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8000/api/user/upload-nic",
        {
          method: "POST",
          body: formData,
          credentials: "include", // ✅ SEND JWT COOKIE
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Upload failed");
      }

      const result = await response.json();
      toast.success(result.message || "NIC uploaded successfully!");
      setModalOpen(false);
      setActiveSubMenu("undefined")
    } catch (err) {
      console.error("Error uploading NIC images:", err);
      toast.error(err.message || "Failed to upload NIC images!");
      setActiveSubMenu("undefined")
    } finally {
      setLoading(false);
      setActiveSubMenu("undefined")
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
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
            <div className="relative h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-400 transition">
              {frontImage ? (
                <img
                  src={URL.createObjectURL(frontImage)}
                  alt="Front CNIC"
                  className="max-h-full max-w-full object-contain rounded"
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
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => handleFileChange(e, "front")}
              />
            </div>
          </div>

          {/* CNIC Back */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CNIC Back
            </label>
            <div className="relative h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-400 transition">
              {backImage ? (
                <img
                  src={URL.createObjectURL(backImage)}
                  alt="Back CNIC"
                  className="max-h-full max-w-full object-contain rounded"
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
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => handleFileChange(e, "back")}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Submit"}
            </button>

            <button
              onClick={() => setActiveSubMenu("undefined")}
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
