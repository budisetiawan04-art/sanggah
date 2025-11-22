import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
    // Safely check for API KEY. In a real app, you handle this gracefully.
    if (!process.env.API_KEY) {
        console.warn("API Key not found in process.env");
        return null;
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const refineDisputeReason = async (rawReason: string, employeeName: string, position: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Buatkan kalimat formal dan sopan untuk pengajuan sanggah absen (koreksi presensi) pegawai.
      
      Data Pegawai:
      Nama: ${employeeName}
      Jabatan: ${position}
      
      Alasan mentah: "${rawReason}"
      
      Instruksi:
      - Gunakan Bahasa Indonesia baku.
      - Langsung berikan isi alasannya saja (satu paragraf), tidak perlu header surat.
      - Tone harus profesional dan memohon.`,
    });

    return response.text?.trim() || rawReason;
  } catch (error) {
    console.error("Gemini Error:", error);
    return rawReason; // Fallback to original text
  }
};