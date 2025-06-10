import React, { useState } from 'react';

const App = () => {
  const [checks, setChecks] = useState({
    stage1: {
      spreadsheetCompleted: false,
      spreadsheetValidated: false
    },
    stage2: {
      psomagenOrderGenerated: false
    },
    stage3: {
      shipSampleLibraries: false
    },
    stage4: {
      ultimaSequencingQC: false,
      fastqFilesDeposited: false,
      fastqManifest: false
    },
    stage5: {
      readCount: false,
      readLength: false,
      md5sumComparisons: false
    },
    stage6: {
      cellrangerQC: false,
      provenanceCheck: false
    },
    stage7: {
      curatedH5adGeneration: false
    }
  });

  const toggleCheck = (stage, checkName) => {
    setChecks(prev => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        [checkName]: !prev[stage][checkName]
      }
    }));
  };

  const getStageProgress = (stage) => {
    const stageChecks = checks[stage];
    const totalChecks = Object.keys(stageChecks).length;
    const passedChecks = Object.values(stageChecks).filter(Boolean).length;
    return { passed: passedChecks, total: totalChecks, percentage: (passedChecks / totalChecks) * 100 };
  };

  const isStageBlocked = (stageNumber) => {
    if (stageNumber === 1) return false;
    if (stageNumber === 2) return getStageProgress('stage1').percentage !== 100;
    if (stageNumber === 3) return getStageProgress('stage2').percentage !== 100;
    if (stageNumber === 4) return getStageProgress('stage3').percentage !== 100;
    if (stageNumber === 5) return getStageProgress('stage4').percentage !== 100;
    if (stageNumber === 6) return getStageProgress('stage5').percentage !== 100;
    if (stageNumber === 7) return getStageProgress('stage6').percentage !== 100;
    return false;
  };

  const getStageResponsibility = (stageNumber) => {
    if ([1, 2, 3].includes(stageNumber)) return 'lab';
    if ([4, 6].includes(stageNumber)) return 'partner';
    if (stageNumber === 5) return 'czi';
    if (stageNumber === 7) return 'lattice';
    return 'lab';
  };

  const getStageAutomation = (stageNumber) => {
    return [2, 5, 6].includes(stageNumber) ? 'auto' : 'manual';
  };

  const ResponsibilityColors = {
    lab: { 
      primary: '#3B82F6', 
      secondary: '#DBEAFE', 
      text: 'Lab',
      glow: 'shadow-blue-500/50'
    },
    partner: { 
      primary: '#8B5CF6', 
      secondary: '#EDE9FE', 
      text: 'Psomagen',
      glow: 'shadow-purple-500/50'
    },
    czi: { 
      primary: '#F59E0B', 
      secondary: '#FEF3C7', 
      text: 'CZI',
      glow: 'shadow-amber-500/50'
    },
    lattice: { 
      primary: '#10B981', 
      secondary: '#D1FAE5', 
      text: 'Lattice',
      glow: 'shadow-emerald-500/50'
    }
  };

  const Toggle = ({ isOn, onClick, disabled = false, label }) => (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full text-left py-2 px-2 rounded border transition-all focus:outline-none focus:ring-1 focus:ring-offset-1 ${
        disabled 
          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
          : isOn
          ? 'bg-green-50 border-green-300 text-green-800 hover:bg-green-100 focus:ring-green-300'
          : 'bg-red-50 border-red-300 text-red-800 hover:bg-red-100 focus:ring-red-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium leading-tight flex-1">
          {label}
        </span>
        <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 ${
          disabled 
            ? 'border-gray-300 bg-gray-200'
            : isOn
            ? 'border-green-500 bg-green-500'
            : 'border-red-400 bg-white'
        }`}>
          {isOn && (
            <div className="w-2 h-2 rounded-full bg-white"></div>
          )}
        </div>
      </div>
    </button>
  );

  const LED = ({ status, size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-2 h-2',
      md: 'w-3 h-3',
      lg: 'w-4 h-4'
    };

    const statusConfig = {
      off: 'bg-gray-300',
      pending: 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50',
      active: 'bg-yellow-500 animate-pulse shadow-lg shadow-yellow-500/50',
      complete: 'bg-green-500 shadow-lg shadow-green-500/50',
      blocked: 'bg-gray-400'
    };

    return (
      <div className={`${sizeClasses[size]} ${statusConfig[status]} rounded-full`} />
    );
  };

  const ActionButton = ({ type, onClick, disabled = false, label }) => {
    const isDownload = type === 'download';
    const isBucket = type === 'bucket';
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          disabled 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : isDownload 
            ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 shadow-lg shadow-green-500/25'
            : isBucket
            ? 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-lg shadow-orange-500/25'
            : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 shadow-lg shadow-blue-500/25'
        }`}
      >
        {label || (isDownload ? '⬇ Download' : isBucket ? '🪣 S3 bucket' : '⬆ Submit')}
      </button>
    );
  };

  const StageCard = ({ title, stage, checks, stageNumber, blocked, hasDownload = false, hasSubmit = false, input, output }) => {
    const progress = getStageProgress(stage);
    const responsibility = getStageResponsibility(stageNumber);
    const automation = getStageAutomation(stageNumber);
    const colors = ResponsibilityColors[responsibility];
    
    const getStageStatus = () => {
      if (blocked) return 'blocked';
      if (progress.percentage === 100) return 'complete';
      if (progress.percentage > 0) return 'active';
      return 'pending';
    };

    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${colors.glow} shadow-lg hover:shadow-xl transition-all p-2 ${responsibility === 'partner' ? 'w-44' : 'w-40'} flex flex-col relative z-20`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-3">
            <LED status={getStageStatus()} size="lg" />
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-1 py-0.5 text-xs font-medium rounded text-white`} style={{ backgroundColor: colors.primary }}>
              {colors.text}
            </span>
            <span className={`px-1 py-0.5 text-xs font-medium rounded ${
              automation === 'auto' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {automation === 'auto' ? '⚡ Auto' : '👤 Manual'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xs font-semibold text-gray-900 mb-1 leading-tight h-8 flex items-center">
          {title}
        </h3>

        {/* Input/Output */}
        <div className="mb-1 text-xs space-y-1 min-h-[3rem]">
          {input && (
            <div className="p-1 bg-purple-50 rounded border-l-2 border-purple-400">
              <span className="font-semibold text-purple-700">IN: </span>
              <span className="text-purple-600 text-xs">{input}</span>
            </div>
          )}
          {output && (
            <div className="p-1 bg-blue-50 rounded border-l-2 border-blue-400">
              <span className="font-semibold text-blue-700">OUT: </span>
              <span className="text-blue-600 text-xs">{output}</span>
            </div>
          )}
        </div>


        {/* Toggles */}
        <div className="space-y-1 mb-2">
          {Object.entries(checks).map(([key, value]) => (
            <Toggle
              key={key}
              isOn={value}
              onClick={() => toggleCheck(stage, key)}
              label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/Q C/g, 'QC')}
              disabled={blocked}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-1">
          {hasDownload && stageNumber === 1 && (
            <ActionButton 
              type="download" 
              onClick={() => alert('Downloading template sheet...')}
              disabled={blocked}
              label="⬇ Template"
            />
          )}
          {hasDownload && stageNumber !== 1 && (
            <ActionButton 
              type="download" 
              onClick={() => alert('Downloading document...')}
              disabled={blocked || progress.percentage === 0}
              label="⬇ Download"
            />
          )}
          {hasSubmit && stageNumber === 1 && (
            <ActionButton 
              type="submit" 
              onClick={() => alert('Submitting metadata...')}
              disabled={blocked}
              label="⬆ Metadata"
            />
          )}
          {hasSubmit && stageNumber !== 1 && (
            <ActionButton 
              type="submit" 
              onClick={() => alert('Submitting document...')}
              disabled={blocked}
              label="⬆ Submit"
            />
          )}
          {[4, 6, 7].includes(stageNumber) && (
            <ActionButton 
              type="bucket" 
              onClick={() => alert('Accessing S3 bucket...')}
              disabled={blocked}
              label="🪣 S3 bucket"
            />
          )}
        </div>

        {/* Status */}
        <div className="mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-end justify-between">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: colors.primary }}
            >
              {stageNumber}
            </div>
            <span className={`text-xs font-medium px-1 py-0.5 rounded ${
              blocked ? 'bg-gray-100 text-gray-600' :
              progress.percentage === 100 ? 'bg-green-100 text-green-800' :
              progress.percentage > 0 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {blocked ? 'BLOCKED' :
               progress.percentage === 100 ? 'COMPLETE' :
               progress.percentage > 0 ? 'ACTIVE' : 'PENDING'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const FieldConnector = ({ fromStage, toStage, hasOutput, hasInput }) => {
    if (!hasOutput || !hasInput) return null;
    
    // Calculate positions for output and input sub-elements
    const cardWidth = 14.28; // 100% / 7 cards
    const outputX = fromStage * cardWidth + cardWidth * 0.95; // Right edge of output field
    const inputX = toStage * cardWidth + cardWidth * 0.05; // Left edge of input field
    const outputY = 32; // Position of output sub-element
    const inputY = 28; // Position of input sub-element
    
    return (
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 25 }}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line
            x1={outputX}
            y1={outputY}
            x2={inputX}
            y2={inputY}
            stroke="#6B7280"
            strokeWidth="0.5"
            opacity="0.7"
          />
        </svg>
      </div>
    );
  };

  const Legend = () => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-3 mb-4">
        <div className="flex items-center justify-center gap-6">
          {Object.entries(ResponsibilityColors).map(([key, colors]) => (
            <div key={key} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: colors.primary }}
              />
              <span className="text-xs font-medium text-gray-700">{colors.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const OverallStatus = () => {
    const allChecks = Object.values(checks).flatMap(stage => Object.values(stage));
    const totalChecks = allChecks.length;
    const passedChecks = allChecks.filter(Boolean).length;
    const percentage = Math.round((passedChecks / totalChecks) * 100);
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-4 mb-4">
        {/* Line 1: Title, percentage, and status dot */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">Perturb-seq of resting CD4+ T Cells</h2>
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
            <LED status={percentage === 100 ? 'complete' : percentage > 50 ? 'active' : 'pending'} size="lg" />
          </div>
        </div>
        
        {/* Line 2: Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              percentage === 100 ? 'bg-green-500' : 
              percentage > 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            BCP Data Generation & Deposition
          </h1>
        </div>

        <OverallStatus />

        {/* Workflow */}
        <div>
          {/* All cards in one row */}
          <div className="grid grid-cols-7 gap-2 justify-center">
            <StageCard
              title="Library Generation & Metadata"
              stage="stage1"
              checks={checks.stage1}
              stageNumber={1}
              blocked={false}
              hasSubmit={true}
              hasDownload={true}
              input="Lattice Metadata Spreadsheet Template"
              output="Filled and Validated Metadata Spreadsheet"
            />
            
            <StageCard
              title="NGS Order Generation"
              stage="stage2"
              checks={checks.stage2}
              stageNumber={2}
              blocked={isStageBlocked(2)}
              hasDownload={true}
              input="Filled and Validated Metadata Spreadsheet"
              output="Filled Psomagen Order Form"
            />
            
            <StageCard
              title="Sample Shipping"
              stage="stage3"
              checks={checks.stage3}
              stageNumber={3}
              blocked={isStageBlocked(3)}
              input="Psomagen Order Form"
            />
            
            <StageCard
              title="Partner Sequencing"
              stage="stage4"
              checks={checks.stage4}
              stageNumber={4}
              blocked={isStageBlocked(4)}
              output="File manifest for all uploaded files with md5sums"
            />
            
            <StageCard
              title="FASTQ Validation"
              stage="stage5"
              checks={checks.stage5}
              stageNumber={5}
              blocked={isStageBlocked(5)}
              input="FASTQ Manifest"
            />
            
            <StageCard
              title="CellRanger Processing"
              stage="stage6"
              checks={checks.stage6}
              stageNumber={6}
              blocked={isStageBlocked(6)}
            />
            
            <StageCard
              title="Curated H5AD Generation"
              stage="stage7"
              checks={checks.stage7}
              stageNumber={7}
              blocked={isStageBlocked(7)}
            />
          </div>
        </div>

        <Legend />
        
        {/* Remove the custom CSS for scrolling */}
      </div>
    </div>
  );
};

export default App;