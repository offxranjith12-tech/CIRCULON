"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Droplets, 
  CheckCircle2, 
  Layers, 
  Activity, 
  Edit3, 
  FileCheck2,
  HelpCircle,
  Cpu
} from "lucide-react";
import { type MaterialQualityAssessment } from "@/lib/types";

interface MaterialAssessmentCardProps {
  assessment: MaterialQualityAssessment;
  materialName: string;
  onOverride?: (updated: Partial<MaterialQualityAssessment>) => void;
  allowEdit?: boolean;
}

export function MaterialAssessmentCard({
  assessment,
  materialName,
  onOverride,
  allowEdit = true
}: MaterialAssessmentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    qualityScore: assessment.qualityScore,
    purityPercentage: assessment.purityPercentage,
    contaminationRisk: assessment.contaminationRisk,
    moistureRisk: assessment.moistureRisk,
    reusePotential: assessment.reusePotential,
    processingDifficulty: assessment.processingDifficulty
  });

  const getRiskColor = (risk: 'Low' | 'Medium' | 'High') => {
    if (risk === 'Low') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (risk === 'Medium') return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (onOverride) {
      onOverride({
        ...formData,
        verifiedByLab: true,
        isPreliminary: false
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-md overflow-hidden">
      {/* Header with Preliminary AI Assessment Badge */}
      <div className="bg-gradient-to-r from-green-950 via-emerald-950 to-green-900 text-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  Quality & Safety Dossier
                </span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
                CIRCULON MATERIAL ASSESSMENT
              </h3>
            </div>
          </div>

          {/* Preliminary AI Assessment Badge / Lab Verified */}
          <div className="flex items-center gap-2">
            {assessment.verifiedByLab ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-200 border border-blue-400/40">
                <FileCheck2 className="w-3.5 h-3.5 text-blue-300" />
                Verified Laboratory Dossier
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-400/40" title="Values are algorithmic projections. Physical laboratory testing recommended prior to hazardous transport.">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Preliminary AI Assessment
              </span>
            )}

            {allowEdit && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-emerald-100 transition-colors"
                title="Override with verified lab or batch values"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Override
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-emerald-200/80 mt-2">
          Automated circular grade classification for <strong className="text-white">{materialName}</strong> based on visual spectrometry and historical batch standards.
        </p>
      </div>

      {/* Primary Metric Score Cards */}
      {!isEditing ? (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className={`p-4 rounded-xl border flex flex-col items-center text-center ${getScoreColor(assessment.qualityScore)}`}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Quality Score</span>
              <span className="text-2xl font-black tracking-tight mt-1">{assessment.qualityScore}/100</span>
              <span className="text-[10px] text-gray-500 mt-0.5">Composite Grade</span>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col items-center text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Purity</span>
              <span className="text-2xl font-black text-gray-900 tracking-tight mt-1">{assessment.purityPercentage}%</span>
              <span className="text-[10px] text-gray-500 mt-0.5">Feedstock Grade</span>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col items-center text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Contamination</span>
              <span className={`px-2.5 py-0.5 mt-2 rounded-full text-xs font-bold border ${getRiskColor(assessment.contaminationRisk)}`}>
                {assessment.contaminationRisk} Risk
              </span>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col items-center text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Moisture Risk</span>
              <span className={`px-2.5 py-0.5 mt-2 rounded-full text-xs font-bold border ${getRiskColor(assessment.moistureRisk)}`}>
                {assessment.moistureRisk} Risk
              </span>
              <span className="text-[10px] text-gray-500 mt-1">{assessment.moisturePercentage}% Moisture</span>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col items-center text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Reuse Potential</span>
              <span className="text-sm font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 mt-2">
                {assessment.reusePotential}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col items-center text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Processing Diff.</span>
              <span className="text-sm font-bold text-gray-800 bg-gray-200/80 px-2.5 py-1 rounded-md mt-2">
                {assessment.processingDifficulty}
              </span>
            </div>
          </div>

          {/* AI Confidence & Explanatory Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Quality & Suitability Factors
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  AI Confidence: {Math.round(assessment.aiConfidence * 100)}%
                </span>
              </div>
              <ul className="space-y-1.5">
                {assessment.qualityFactors.map((factor, idx) => (
                  <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-amber-600" />
                  Contamination & Condition Factors
                </span>
                <span className="text-xs font-medium text-gray-500">
                  Physical State: {assessment.conditionDescription || 'Clean & Sorted'}
                </span>
              </div>
              <ul className="space-y-1.5">
                {assessment.contaminationFactors.map((factor, idx) => (
                  <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Processing Steps */}
          <div className="p-4 rounded-xl border border-gray-200 bg-white">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-2">
              Recommended Processing Prior to Valorization
            </span>
            <div className="flex flex-wrap gap-2">
              {assessment.recommendedProcessing.map((step, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  {step}
                </span>
              ))}
            </div>
          </div>

          {/* Legal / AI Disclaimer */}
          <div className="flex items-start gap-2 text-[11px] text-gray-500 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Important Compliance Notice:</strong> CIRCULON does not claim laboratory-grade chemical composition or toxicological safety certification solely from optical imagery or vendor declarations. Image/AI-derived values are classified as a <em>Preliminary AI Assessment</em>. Verified laboratory test reports or user-audited data can override these metrics.
            </p>
          </div>
        </div>
      ) : (
        /* Override Form */
        <form onSubmit={handleSaveOverride} className="p-6 space-y-4 bg-gray-50">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h4 className="font-bold text-gray-900 text-sm">Override Preliminary Assessment with Lab Data</h4>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-gray-500 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Quality Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.qualityScore}
                onChange={e => setFormData({ ...formData, qualityScore: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Purity Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.purityPercentage}
                onChange={e => setFormData({ ...formData, purityPercentage: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Contamination Risk</label>
              <select
                value={formData.contaminationRisk}
                onChange={e => setFormData({ ...formData, contaminationRisk: e.target.value as any })}
                className="w-full p-2 border rounded-lg text-sm bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Moisture Risk</label>
              <select
                value={formData.moistureRisk}
                onChange={e => setFormData({ ...formData, moistureRisk: e.target.value as any })}
                className="w-full p-2 border rounded-lg text-sm bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Reuse Potential</label>
              <select
                value={formData.reusePotential}
                onChange={e => setFormData({ ...formData, reusePotential: e.target.value as any })}
                className="w-full p-2 border rounded-lg text-sm bg-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Processing Difficulty</label>
              <select
                value={formData.processingDifficulty}
                onChange={e => setFormData({ ...formData, processingDifficulty: e.target.value as any })}
                className="w-full p-2 border rounded-lg text-sm bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
            >
              Save Verified Assessment
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
