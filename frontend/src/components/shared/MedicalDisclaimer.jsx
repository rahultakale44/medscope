import { AlertCircle } from "lucide-react";

export default function MedicalDisclaimer({ message }) {
  const defaultMessage =
    "MedScope is intended for medical literature research and educational purposes only. It does not replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions.";

  return (
    <div className="medical-disclaimer">
      <AlertCircle />
      <p>{message || defaultMessage}</p>
    </div>
  );
}
