import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, Sparkles, AlertCircle, CheckCircle2, 
  Droplets, ShieldCheck, X, Loader2, ArrowRight
} from 'lucide-react';
import { Stream, Observation } from '../types';
import { api } from '../services/api';

interface ObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  streams: Stream[];
  selectedStream?: Stream | null;
  onObservationCreated: (obs: Observation) => void;
}

export const ObservationModal: React.FC<ObservationModalProps> = ({
  isOpen,
  onClose,
  streams,
  selectedStream,
  onObservationCreated
}) => {
  const [streamId, setStreamId] = useState<string>(selectedStream?.id || (streams[0]?.id || 'stream-1'));
  const [waterAppearance, setWaterAppearance] = useState<string>('Normal / Clear');
  const [smell, setSmell] = useState<string>('None / Natural Earthy');
  const [visibleLitter, setVisibleLitter] = useState<boolean>(false);
  const [litterType, setLitterType] = useState<string>('');
  const [algaePresent, setAlgaePresent] = useState<boolean>(false);
  const [algaeType, setAlgaeType] = useState<string>('');
  const [aquaticOrganisms, setAquaticOrganisms] = useState<string>('');
  const [vegetation, setVegetation] = useState<string>('');
  const [unusualEvents, setUnusualEvents] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('Alex Rivera (Citizen)');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedObs, setSubmittedObs] = useState<Observation | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string>('');
  const [selectedImageName, setSelectedImageName] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Unsupported file type. Please choose a JPG, JPEG, PNG, or WEBP image.');
      e.target.value = '';
      return;
    }

    setImageError('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImageBase64(reader.result);
        setSelectedImageName(file.name);
      }
    };
    reader.onerror = () => {
      setImageError('Could not read the selected image. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImageBase64('');
    setSelectedImageName('');
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Sample photo presets for fast testing during demo
  const samplePhotos = [
    { label: 'Plastic Debris Snag', url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80', litter: true, appearance: 'Brown / Muddy' },
    { label: 'Floating Bottles & Bags', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80', litter: true, appearance: 'Cloudy / Turbid' },
    { label: 'Green Algal Film', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', litter: false, appearance: 'Green / Algal Tint' },
    { label: 'Clear Riparian Stream', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80', litter: false, appearance: 'Normal / Clear' },
  ];

  const handleSelectSamplePhoto = (sample: typeof samplePhotos[0]) => {
    setPhotoUrl(sample.url);
    setVisibleLitter(sample.litter);
    if (sample.litter) setLitterType('Plastic packaging, bottles, and snack wrappers');
    setWaterAppearance(sample.appearance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const stream = streams.find(s => s.id === streamId) || streams[0];

    const payload = {
      stream_id: streamId,
      latitude: stream ? stream.latitude + 0.0005 : 30.2625,
      longitude: stream ? stream.longitude + 0.0005 : -97.7289,
      water_appearance: waterAppearance,
      smell: smell,
      visible_litter: visibleLitter,
      litter_type: visibleLitter ? litterType : undefined,
      algae_present: algaePresent,
      algae_type: algaePresent ? algaeType : undefined,
      aquatic_organisms: aquaticOrganisms || undefined,
      vegetation: vegetation || undefined,
      unusual_events: unusualEvents || undefined,
      reporter_name: reporterName,
      notes: notes || undefined,
      photo_url: photoUrl || undefined,
      photo_base64: selectedImageBase64 || undefined
    };

    try {
      const res = await api.submitObservation(payload);
      setSubmittedObs(res);
      onObservationCreated(res);
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedObs(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl relative">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-950/90 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {submittedObs ? 'AI Observation Assessment' : 'Citizen Stream Observation'}
              </h2>
              <p className="text-xs text-slate-400">
                {submittedObs ? 'AI-assisted visual & sensory evaluation completed' : 'Guided citizen science report • No specialized ecology background required'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleResetAndClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {submittedObs ? (
            /* Post-Submission AI Assessment View (Section 8 Requirement) */
            <div className="space-y-5 animate-fadeIn">
              
              <div className="bg-emerald-950/40 border border-emerald-700/60 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-300 text-sm">Observation Logged Successfully!</div>
                  <p className="text-xs text-emerald-200/90 mt-0.5">
                    Your citizen science contribution has updated the stream health index and spatial clustering model. +25 Eco Points awarded!
                  </p>
                </div>
              </div>

              {submittedObs.ai_analysis && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        AI Multimodal Inference
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Confidence:</span>
                      <span className="text-xs font-black text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                        {submittedObs.ai_analysis.confidence_score}%
                      </span>
                    </div>
                  </div>

                  {/* Classification & Concern */}
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Classification</div>
                    <div className="text-sm font-bold text-slate-100 mt-0.5">
                      {submittedObs.ai_analysis.classification}
                    </div>
                    <div className="text-xs text-slate-300 mt-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-semibold">Potential Concern: </span>
                      {submittedObs.ai_analysis.potential_concern}
                    </div>
                  </div>

                  {/* Detected Indicators */}
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                      Possible Indicators Detected
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {submittedObs.ai_analysis.detected_indicators.map((ind, i) => (
                        <span key={i} className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-cyan-300">
                          • {ind}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Evidence & Rationale */}
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Evidence & Reasoning</div>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      "{submittedObs.ai_analysis.rationale}"
                    </p>
                  </div>

                  {/* Human Verification Tag */}
                  <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg flex items-center justify-between text-xs">
                    <span className="text-amber-200 flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="h-4 w-4 text-amber-400" />
                      Human Verification Status
                    </span>
                    <span className="font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase text-[10px]">
                      {submittedObs.ai_analysis.human_verification_recommended ? 'RECOMMENDED' : 'BASELINE CONFIRMED'}
                    </span>
                  </div>

                  {/* Responsible AI Disclaimer */}
                  <p className="text-[10px] text-slate-500 italic">
                    * {submittedObs.ai_analysis.disclaimer}
                  </p>
                </div>
              )}

              <button
                onClick={handleResetAndClose}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md"
              >
                Done • View on Watershed Map
              </button>

            </div>
          ) : (
            /* Guided Citizen Form (Section 7) */
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              
              {/* Stream Selection */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Target Stream Reach
                </label>
                <select
                  value={streamId}
                  onChange={(e) => setStreamId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {streams.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.location_name}) — Score: {s.health_score}/100
                    </option>
                  ))}
                </select>
              </div>

              {/* Photo Upload / Preset Selection */}
              <div>
                <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Observation Photo</span>
                  <span className="text-[11px] text-slate-400 font-normal">Upload a photo, select a demo photo, or enter URL</span>
                </label>

                {/* Real Image Upload */}
                <div className="mb-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleImageSelected}
                    className="hidden"
                  />

                  {selectedImageBase64 ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedImageBase64}
                        alt="Selected upload preview"
                        className="h-20 w-28 object-cover rounded-lg border border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-200 font-medium truncate">{selectedImageName}</div>
                        <div className="text-[11px] text-slate-400 mb-2">Image ready to upload</div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-3 py-1 rounded-lg border border-red-800/60 text-red-300 hover:bg-red-950/40 font-semibold transition-colors flex items-center gap-1"
                          >
                            <X className="h-3 w-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-2 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        Choose Image
                      </button>
                      <span className="text-[11px] text-slate-400">JPG, JPEG, PNG or WEBP</span>
                    </div>
                  )}

                  {imageError && (
                    <p className="text-[11px] text-red-300 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {imageError}
                    </p>
                  )}
                </div>
                
                {/* Sample Photo Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {samplePhotos.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSamplePhoto(sample)}
                      className={`relative rounded-lg overflow-hidden border p-1 text-left transition-all ${
                        photoUrl === sample.url
                          ? 'border-cyan-400 ring-2 ring-cyan-500/30'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img src={sample.url} alt={sample.label} className="h-16 w-full object-cover rounded" />
                      <div className="text-[10px] text-slate-300 mt-1 truncate font-medium">
                        {sample.label}
                      </div>
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Or paste an image URL directly..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Question: Water Appearance */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  1. What does the water look like?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Normal / Clear',
                    'Cloudy / Turbid',
                    'Brown / Muddy',
                    'Green / Algal Tint',
                    'Foamy / Frothy',
                    'Unusual Chemical Sheen / Discolored'
                  ].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setWaterAppearance(opt)}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        waterAppearance === opt
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question: Smell */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  2. Do you notice an unusual smell?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'None / Natural Earthy',
                    'Musty / Stagnant',
                    'Sewage / Rotten Egg',
                    'Chemical / Solvent',
                    'Dead Fish / Decomposing'
                  ].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSmell(opt)}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        smell === opt
                          ? 'bg-amber-950 border-amber-500 text-amber-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question: Visible Litter */}
              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-300">3. Is there visible solid litter?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVisibleLitter(false)}
                      className={`px-3 py-1 rounded text-xs ${!visibleLitter ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibleLitter(true)}
                      className={`px-3 py-1 rounded text-xs ${visibleLitter ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Yes
                    </button>
                  </div>
                </div>

                {visibleLitter && (
                  <input
                    type="text"
                    placeholder="Litter types (e.g. Plastic bottles, styrofoam containers, wrappers)..."
                    value={litterType}
                    onChange={(e) => setLitterType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 mt-2"
                  />
                )}
              </div>

              {/* Question: Algae */}
              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-300">4. Visible algae or surface biofilm?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAlgaePresent(false)}
                      className={`px-3 py-1 rounded text-xs ${!algaePresent ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlgaePresent(true)}
                      className={`px-3 py-1 rounded text-xs ${algaePresent ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Yes
                    </button>
                  </div>
                </div>

                {algaePresent && (
                  <input
                    type="text"
                    placeholder="Algae appearance (e.g. Green scum, thick mats, mossy rocks)..."
                    value={algaeType}
                    onChange={(e) => setAlgaeType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 mt-2"
                  />
                )}
              </div>

              {/* Optional Field: Notes */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Optional Observations & Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Fallen branch snag, minnows observed, overflowing culvert..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing with AquaGuardian AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Submit & Run AI Assessment</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
