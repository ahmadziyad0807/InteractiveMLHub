import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Brain, Play, Code2, BarChart3, Settings, CheckCircle2, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface AlgorithmResult {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  trainTime?: number;
  mse?: number;
  rmse?: number;
  r2Score?: number;
  mae?: number;
  oobScore?: number;
  supportVectors?: number;
  featureImportance?: Array<{ feature: string; importance: number }>;
  confusionMatrix?: number[][];
  weights?: number[];
  chartData?: Array<{ x: number; y: number; predicted: number; class: string }>;
  performanceData?: Array<{ epoch: number; accuracy: number; loss: number }>;
}

// Tooltip component for code explanations
const CodeTooltip = ({ children, explanation }: { children: React.ReactNode; explanation: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <span className="relative inline-block">
      <span 
        className="cursor-help hover:bg-blue-100 hover:text-blue-800 rounded px-1 transition-colors duration-200"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </span>
      {isVisible && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
          <div className="relative">
            {explanation}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </span>
  );
};

// ML Term tooltip component
const MLTermTooltip = ({ term, definition }: { term: string; definition: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <span className="relative inline-block">
      <span 
        className="cursor-help text-blue-600 hover:text-blue-800 underline decoration-dotted transition-colors duration-200"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {term}
      </span>
      {isVisible && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-72 p-3 bg-blue-900 text-white text-sm rounded-lg shadow-lg">
          <div className="relative">
            <strong className="text-blue-200">{term}:</strong> {definition}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-900"></div>
          </div>
        </div>
      )}
    </span>
  );
};

// Helper function to render beginner-friendly code with tooltips
const renderBeginnerCode = (codeLines: Array<{ code: string; explanation: string }>) => {
  return codeLines.map((line, index) => (
    <div key={index} className="group">
      <CodeTooltip explanation={line.explanation}>
        <div className="font-mono text-xs leading-tight py-0.5 hover:bg-blue-50 rounded transition-colors duration-200">
          {line.code}
        </div>
      </CodeTooltip>
    </div>
  ));
};

export const MLShowcase = () => {
  // Knowledge level state
  const [knowledgeLevel, setKnowledgeLevel] = useState(3);

  // Get knowledge level info
  const getKnowledgeLevelInfo = (level: number) => {
    switch (level) {
      case 1:
        return { label: "Beginner", color: "text-green-600", bgColor: "bg-green-100", description: "New to ML concepts" };
      case 2:
        return { label: "Beginner+", color: "text-green-600", bgColor: "bg-green-100", description: "Basic understanding" };
      case 3:
        return { label: "Intermediate", color: "text-blue-600", bgColor: "bg-blue-100", description: "Some ML experience" };
      case 4:
        return { label: "Intermediate+", color: "text-blue-600", bgColor: "bg-blue-100", description: "Good ML knowledge" };
      case 5:
        return { label: "Expert", color: "text-purple-600", bgColor: "bg-purple-100", description: "Advanced practitioner" };
      default:
        return { label: "Intermediate", color: "text-blue-600", bgColor: "bg-blue-100", description: "Some ML experience" };
    }
  };

  const levelInfo = getKnowledgeLevelInfo(knowledgeLevel);

  // Collapsible state for code sections
  const [codeOpen, setCodeOpen] = useState({
    xgboost: false,
    knn: false,
    linear: false,
    rf: false,
    svm: false
  });

  // XGBoost state
  const [xgbParams, setXgbParams] = useState({
    maxDepth: 3,
    learningRate: 0.1,
    nEstimators: 100,
    subsample: 0.8,
  });
  const [xgbResult, setXgbResult] = useState<AlgorithmResult | null>(null);
  const [xgbLoading, setXgbLoading] = useState(false);

  // k-NN state
  const [knnParams, setKnnParams] = useState({
    nNeighbors: 5,
    weights: "uniform",
    algorithm: "auto",
  });
  const [knnResult, setKnnResult] = useState<AlgorithmResult | null>(null);
  const [knnLoading, setKnnLoading] = useState(false);

  // Linear Learner state
  const [linearParams, setLinearParams] = useState({
    learningRate: 0.01,
    epochs: 100,
    regularization: 0.01,
  });
  const [linearResult, setLinearResult] = useState<AlgorithmResult | null>(null);
  const [linearLoading, setLinearLoading] = useState(false);

  // Random Forest state
  const [rfParams, setRfParams] = useState({
    nEstimators: 100,
    maxDepth: 10,
    minSamplesSplit: 2,
    maxFeatures: "sqrt",
  });
  const [rfResult, setRfResult] = useState<AlgorithmResult | null>(null);
  const [rfLoading, setRfLoading] = useState(false);

  // SVM state
  const [svmParams, setSvmParams] = useState({
    kernel: "rbf",
    c: 1.0,
    gamma: "scale",
  });
  const [svmResult, setSvmResult] = useState<AlgorithmResult | null>(null);
  const [svmLoading, setSvmLoading] = useState(false);

  // Generate sample data for visualizations
  const generateSampleData = (algorithm: string, params: any) => {
    const dataPoints = 50;
    const data = [];
    
    for (let i = 0; i < dataPoints; i++) {
      const x = (i / dataPoints) * 10;
      let y = 0;
      
      switch (algorithm) {
        case 'xgboost':
          // Simulate XGBoost decision boundary
          y = Math.sin(x * params.maxDepth / 3) * Math.exp(-x / 5) + Math.random() * 0.3;
          break;
        case 'knn':
          // Simulate k-NN classification regions
          y = Math.abs(Math.sin(x * params.nNeighbors / 5)) + Math.random() * 0.2;
          break;
        case 'linear':
          // Linear relationship
          y = x * 0.5 + Math.random() * 0.4;
          break;
        case 'rf':
          // Random Forest ensemble prediction
          y = Math.sin(x) * Math.cos(x * 0.5) + Math.random() * 0.3;
          break;
        case 'svm':
          // SVM decision boundary
          y = Math.tanh(x - 5) * 2 + Math.random() * 0.2;
          break;
      }
      
      data.push({
        x: parseFloat(x.toFixed(2)),
        y: parseFloat(y.toFixed(2)),
        predicted: parseFloat((y + (Math.random() - 0.5) * 0.1).toFixed(2)),
        class: y > 0 ? 'Class A' : 'Class B'
      });
    }
    
    return data;
  };

  const generatePerformanceData = (accuracy: number) => {
    return [
      { epoch: 1, accuracy: Math.max(0.3, accuracy - 0.4), loss: 1.2 },
      { epoch: 5, accuracy: Math.max(0.4, accuracy - 0.3), loss: 0.9 },
      { epoch: 10, accuracy: Math.max(0.5, accuracy - 0.2), loss: 0.7 },
      { epoch: 15, accuracy: Math.max(0.6, accuracy - 0.15), loss: 0.5 },
      { epoch: 20, accuracy: Math.max(0.7, accuracy - 0.1), loss: 0.4 },
      { epoch: 25, accuracy: Math.max(0.75, accuracy - 0.05), loss: 0.3 },
      { epoch: 30, accuracy: accuracy, loss: 0.25 }
    ];
  };

  const runXGBoost = () => {
    setXgbLoading(true);
    setTimeout(() => {
      // Dynamic results based on parameters
      const baseAccuracy = 0.85;
      const depthBonus = (xgbParams.maxDepth / 10) * 0.08;
      const lrPenalty = Math.abs(0.1 - xgbParams.learningRate) * 0.1;
      const estimatorBonus = (xgbParams.nEstimators / 500) * 0.05;
      
      const accuracy = Math.min(0.98, baseAccuracy + depthBonus - lrPenalty + estimatorBonus);
      const trainTime = (xgbParams.nEstimators / 100) * (xgbParams.maxDepth / 3) * 0.5;
      
      setXgbResult({
        accuracy: Number(accuracy.toFixed(3)),
        precision: Number((accuracy - 0.02).toFixed(3)),
        recall: Number((accuracy - 0.03).toFixed(3)),
        f1Score: Number((accuracy - 0.025).toFixed(3)),
        trainTime: Number(trainTime.toFixed(2)),
        featureImportance: [
          { feature: "Feature_1", importance: 0.35 },
          { feature: "Feature_2", importance: 0.28 },
          { feature: "Feature_3", importance: 0.19 },
          { feature: "Feature_4", importance: 0.12 },
          { feature: "Feature_5", importance: 0.06 },
        ],
        chartData: generateSampleData('xgboost', xgbParams),
        performanceData: generatePerformanceData(accuracy),
      });
      setXgbLoading(false);
    }, 2000);
  };

  const runKNN = () => {
    setKnnLoading(true);
    setTimeout(() => {
      // Dynamic results based on k neighbors
      const baseAccuracy = 0.82;
      const kBonus = Math.abs(5 - knnParams.nNeighbors) < 3 ? 0.05 : 0;
      const weightBonus = knnParams.weights === "distance" ? 0.03 : 0;
      
      const accuracy = Math.min(0.95, baseAccuracy + kBonus + weightBonus);
      const trainTime = knnParams.nNeighbors * 0.15;
      
      setKnnResult({
        accuracy: Number(accuracy.toFixed(3)),
        precision: Number((accuracy - 0.02).toFixed(3)),
        recall: Number((accuracy - 0.03).toFixed(3)),
        f1Score: Number((accuracy - 0.025).toFixed(3)),
        trainTime: Number(trainTime.toFixed(2)),
        confusionMatrix: [
          [Math.round(85 * accuracy / 0.87), Math.round(15 * (1 - accuracy / 0.87))],
          [Math.round(16 * (1 - accuracy / 0.87)), Math.round(84 * accuracy / 0.87)],
        ],
        chartData: generateSampleData('knn', knnParams),
        performanceData: generatePerformanceData(accuracy),
      });
      setKnnLoading(false);
    }, 1500);
  };

  const runLinear = () => {
    setLinearLoading(true);
    setTimeout(() => {
      // Dynamic results based on learning rate and epochs
      const baseMSE = 0.05;
      const lrImpact = Math.abs(0.01 - linearParams.learningRate) * 0.5;
      const epochBonus = (linearParams.epochs / 1000) * 0.02;
      const regPenalty = linearParams.regularization * 0.01;
      
      const mse = Math.max(0.01, baseMSE + lrImpact - epochBonus + regPenalty);
      const rmse = Math.sqrt(mse);
      const r2Score = Math.max(0.7, 0.95 - mse * 2);
      const trainTime = (linearParams.epochs / 100) * 0.2;
      
      setLinearResult({
        mse: Number(mse.toFixed(3)),
        rmse: Number(rmse.toFixed(3)),
        r2Score: Number(r2Score.toFixed(3)),
        mae: Number((mse * 0.8).toFixed(3)),
        trainTime: Number(trainTime.toFixed(2)),
        weights: [0.45, -0.32, 0.28, 0.15],
        chartData: generateSampleData('linear', linearParams),
        performanceData: generatePerformanceData(r2Score),
      });
      setLinearLoading(false);
    }, 1800);
  };

  const runRandomForest = () => {
    setRfLoading(true);
    setTimeout(() => {
      // Dynamic results based on parameters
      const baseAccuracy = 0.88;
      const estimatorBonus = (rfParams.nEstimators / 500) * 0.06;
      const depthBonus = (rfParams.maxDepth / 20) * 0.04;
      
      const accuracy = Math.min(0.97, baseAccuracy + estimatorBonus + depthBonus);
      const trainTime = (rfParams.nEstimators / 100) * (rfParams.maxDepth / 10) * 0.8;
      
      setRfResult({
        accuracy: Number(accuracy.toFixed(3)),
        precision: Number((accuracy - 0.01).toFixed(3)),
        recall: Number((accuracy - 0.02).toFixed(3)),
        f1Score: Number((accuracy - 0.015).toFixed(3)),
        trainTime: Number(trainTime.toFixed(2)),
        oobScore: Number((accuracy - 0.03).toFixed(3)),
        featureImportance: [
          { feature: "Feature_1", importance: 0.28 },
          { feature: "Feature_2", importance: 0.24 },
          { feature: "Feature_3", importance: 0.21 },
          { feature: "Feature_4", importance: 0.15 },
          { feature: "Feature_5", importance: 0.12 },
        ],
        chartData: generateSampleData('rf', rfParams),
        performanceData: generatePerformanceData(accuracy),
      });
      setRfLoading(false);
    }, 2200);
  };

  const runSVM = () => {
    setSvmLoading(true);
    setTimeout(() => {
      // Dynamic results based on kernel and C parameter
      const baseAccuracy = 0.84;
      const kernelBonus = svmParams.kernel === "rbf" ? 0.06 : svmParams.kernel === "poly" ? 0.03 : 0;
      const cBonus = Math.min(0.05, (svmParams.c / 10) * 0.05);
      
      const accuracy = Math.min(0.96, baseAccuracy + kernelBonus + cBonus);
      const trainTime = svmParams.c * 1.5;
      
      setSvmResult({
        accuracy: Number(accuracy.toFixed(3)),
        precision: Number((accuracy - 0.02).toFixed(3)),
        recall: Number((accuracy - 0.025).toFixed(3)),
        f1Score: Number((accuracy - 0.0225).toFixed(3)),
        trainTime: Number(trainTime.toFixed(2)),
        supportVectors: Math.round(150 + svmParams.c * 20),
        chartData: generateSampleData('svm', svmParams),
        performanceData: generatePerformanceData(accuracy),
      });
      setSvmLoading(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Interactive AL ML Learning Hub
            </h1>
          </div>
        </div>

      <div className="space-y-6">
        {/* Algorithm Selection Guide */}
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-6">
            <div className="p-3 bg-indigo-600 rounded-lg shadow-lg flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            
            {/* Main Content - 65% */}
            <div className="flex-1 min-w-0" style={{ flex: '0 0 65%' }}>
              <h2 className="text-2xl font-bold text-indigo-900 mb-2">
                🚀 Explore Machine Learning Algorithms
              </h2>
              <p className="text-indigo-700 mb-4 leading-relaxed">
                Select any algorithm tab below to dive into interactive learning. Each tab contains:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                <div className="flex items-center gap-2 text-indigo-600">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span>Interactive parameter tuning</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-600">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span>Real-time model training</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-600">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span>Interactive visualizations</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-600">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span>Complete Python code examples</span>
                </div>
              </div>
              
              <div className="p-3 bg-white/60 rounded-lg border border-indigo-200">
                <p className="text-sm text-indigo-800 font-medium">
                  💡 <strong>How to use:</strong> Set your knowledge level → Click any algorithm tab → Adjust parameters → Click "Run Model" → Explore results and charts
                </p>
              </div>
            </div>

            {/* Knowledge Level Slider - 40% */}
            <div className="flex-shrink-0" style={{ flex: '0 0 35%' }}>
              <div className="p-3 bg-white/90 rounded-lg border border-indigo-200 shadow-sm h-full">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-indigo-900 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    ML Knowledge Level
                  </h3>
                </div>
                
                <div className="space-y-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium text-center ${levelInfo.bgColor} ${levelInfo.color}`}>
                    Level {knowledgeLevel}: {levelInfo.label}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-12">Beginner</span>
                      <div className="flex-1">
                        <Slider
                          value={[knowledgeLevel]}
                          onValueChange={(value: number[]) => setKnowledgeLevel(value[0])}
                          min={1}
                          max={5}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-10">Expert</span>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-400 px-12">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-indigo-700 bg-indigo-50 p-2 rounded leading-tight">
                    <strong>{levelInfo.description}</strong> - Content adapts to your level
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      <Tabs defaultValue="xgboost" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded-xl border border-blue-100 shadow-sm backdrop-blur-sm">
          <TabsTrigger 
            value="xgboost" 
            className="flex items-center gap-2 px-3 py-3 rounded-lg font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-200 data-[state=active]:scale-105 data-[state=active]:border-blue-300 hover:bg-white/70 hover:shadow-md hover:scale-102 border border-transparent"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span className="hidden sm:inline">XGBoost</span>
            <span className="sm:hidden">XGB</span>
          </TabsTrigger>
          <TabsTrigger 
            value="knn" 
            className="flex items-center gap-2 px-3 py-3 rounded-lg font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-200 data-[state=active]:scale-105 data-[state=active]:border-green-300 hover:bg-white/70 hover:shadow-md hover:scale-102 border border-transparent"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="hidden sm:inline">k-NN</span>
            <span className="sm:hidden">kNN</span>
          </TabsTrigger>
          <TabsTrigger 
            value="linear" 
            className="flex items-center gap-2 px-3 py-3 rounded-lg font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-200 data-[state=active]:scale-105 data-[state=active]:border-purple-300 hover:bg-white/70 hover:shadow-md hover:scale-102 border border-transparent"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            <span className="hidden md:inline">Linear Learner</span>
            <span className="md:hidden hidden sm:inline">Linear</span>
            <span className="sm:hidden">Lin</span>
          </TabsTrigger>
          <TabsTrigger 
            value="rf" 
            className="flex items-center gap-2 px-3 py-3 rounded-lg font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-200 data-[state=active]:scale-105 data-[state=active]:border-emerald-300 hover:bg-white/70 hover:shadow-md hover:scale-102 border border-transparent"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
            </svg>
            <span className="hidden md:inline">Random Forest</span>
            <span className="md:hidden hidden sm:inline">Forest</span>
            <span className="sm:hidden">RF</span>
          </TabsTrigger>
          <TabsTrigger 
            value="svm" 
            className="flex items-center gap-2 px-3 py-3 rounded-lg font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-orange-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-200 data-[state=active]:scale-105 data-[state=active]:border-orange-300 hover:bg-white/70 hover:shadow-md hover:scale-102 border border-transparent"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
            </svg>
            <span className="hidden sm:inline">SVM</span>
            <span className="sm:hidden">SV</span>
          </TabsTrigger>
        </TabsList>

        {/* XGBoost Tab */}
        <TabsContent value="xgboost" className="space-y-4 animate-in fade-in-50 duration-500">
          <Card className="border-blue-200 shadow-lg shadow-blue-100/50 hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-200">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900">XGBoost</h3>
                  <p className="text-sm text-blue-600 font-normal">Extreme Gradient Boosting</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">
                  {knowledgeLevel <= 2 ? (
                    <>
                      <MLTermTooltip 
                        term="XGBoost" 
                        definition="Extreme Gradient Boosting - a powerful machine learning algorithm that combines many simple models to make better predictions"
                      /> is a powerful <MLTermTooltip 
                        term="machine learning algorithm" 
                        definition="A computer program that learns patterns from data to make predictions or decisions without being explicitly programmed for each specific task"
                      /> that combines many simple models (called <MLTermTooltip 
                        term="decision trees" 
                        definition="A model that makes decisions by asking a series of yes/no questions about the data, like a flowchart"
                      />) to make better predictions. Think of it like asking many experts for their opinion and then combining their answers to get the best result.
                    </>
                  ) : knowledgeLevel <= 4 ? (
                    "XGBoost is an optimized distributed gradient boosting library designed to be highly efficient, flexible and portable. It implements machine learning algorithms under the Gradient Boosting framework, combining weak learners sequentially to create a strong predictive model."
                  ) : (
                    "XGBoost implements a scalable end-to-end tree boosting system with novel sparsity-aware algorithms, weighted quantile sketch for approximate tree learning, and parallel/distributed computing optimizations. It uses second-order Taylor expansion for loss function optimization and regularization techniques to prevent overfitting."
                  )}
                </p>
              </div>

              {/* Interactive Hyperparameter Tuning */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <h4 className="font-semibold">Interactive Hyperparameter Tuning</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Depth: {xgbParams.maxDepth}</Label>
                    <Slider
                      value={[xgbParams.maxDepth]}
                      onValueChange={(v: number[]) => setXgbParams({...xgbParams, maxDepth: v[0]})}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Learning Rate: {xgbParams.learningRate}</Label>
                    <Slider
                      value={[xgbParams.learningRate * 10]}
                      onValueChange={(v: number[]) => setXgbParams({...xgbParams, learningRate: v[0] / 10})}
                      min={0.1}
                      max={10}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>N Estimators: {xgbParams.nEstimators}</Label>
                    <Slider
                      value={[xgbParams.nEstimators]}
                      onValueChange={(v: number[]) => setXgbParams({...xgbParams, nEstimators: v[0]})}
                      min={10}
                      max={500}
                      step={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subsample: {xgbParams.subsample}</Label>
                    <Slider
                      value={[xgbParams.subsample * 10]}
                      onValueChange={(v: number[]) => setXgbParams({...xgbParams, subsample: v[0] / 10})}
                      min={5}
                      max={10}
                      step={1}
                    />
                  </div>
                </div>

                <Button onClick={runXGBoost} disabled={xgbLoading} className="w-full">
                  {xgbLoading ? (
                    <>Training Model...</>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run XGBoost Model
                    </>
                  )}
                </Button>
              </div>

              {/* Collapsible Python Code */}
              <Collapsible open={codeOpen.xgboost} onOpenChange={(open: boolean) => setCodeOpen({...codeOpen, xgboost: open})}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4" />
                      <span>View Python Implementation</span>
                    </div>
                    {codeOpen.xgboost ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Code2 className="h-4 w-4" />
                      <h4 className="font-semibold">Python Implementation</h4>
                      {knowledgeLevel <= 2 && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          <HelpCircle className="h-3 w-3" />
                          Hover over code lines for explanations
                        </div>
                      )}
                    </div>
                    {knowledgeLevel <= 2 ? (
                      <div className="bg-background p-3 rounded border space-y-0">
                        {renderBeginnerCode([
                          {
                            code: "import xgboost as xgb",
                            explanation: "This imports the XGBoost library and gives it a shorter name 'xgb' so we can use it easily. Think of it like getting a toolbox for building smart prediction models."
                          },
                          {
                            code: "from sklearn.model_selection import train_test_split",
                            explanation: "This imports a function that helps us split our data into two parts: one for teaching the model (training) and one for testing how well it learned."
                          },
                          {
                            code: "from sklearn.metrics import accuracy_score, classification_report",
                            explanation: "These are tools to measure how good our model is at making predictions. Accuracy tells us what percentage of predictions were correct."
                          },
                          {
                            code: "import numpy as np",
                            explanation: "NumPy is a library for working with numbers and arrays (lists of numbers). It makes mathematical calculations much faster."
                          },
                          {
                            code: "# Load and prepare data",
                            explanation: "Comments (lines starting with #) are notes for humans to read. This section is about getting our data ready."
                          },
                          {
                            code: "X_train, X_test, y_train, y_test = train_test_split(",
                            explanation: "This splits our data into 4 parts: X_train (features for training), X_test (features for testing), y_train (correct answers for training), y_test (correct answers for testing)."
                          },
                          {
                            code: "    X, y, test_size=0.2, random_state=42",
                            explanation: "X is our input data (features), y is what we want to predict. test_size=0.2 means 20% goes to testing, 80% to training. random_state=42 ensures we get the same split every time."
                          },
                          {
                            code: ")",
                            explanation: "This closes the train_test_split function call."
                          },
                          {
                            code: "# Set hyperparameters",
                            explanation: "Hyperparameters are settings that control how the model learns. Think of them like knobs you can turn to make the model work better."
                          },
                          {
                            code: "params = {",
                            explanation: "This creates a dictionary (like a list of settings) with all our hyperparameter values."
                          },
                          {
                            code: `    'max_depth': ${xgbParams.maxDepth},`,
                            explanation: "Max depth controls how complex each decision tree can be. Higher values mean more complex trees that can learn more details but might overfit."
                          },
                          {
                            code: `    'learning_rate': ${xgbParams.learningRate},`,
                            explanation: "Learning rate controls how fast the model learns. Smaller values mean slower but more careful learning, larger values mean faster but potentially less accurate learning."
                          },
                          {
                            code: `    'n_estimators': ${xgbParams.nEstimators},`,
                            explanation: "This is how many decision trees we want to combine together. More trees usually mean better predictions but take longer to train."
                          },
                          {
                            code: `    'subsample': ${xgbParams.subsample},`,
                            explanation: "Subsample controls what fraction of the training data each tree sees. Using less than 1.0 helps prevent overfitting by adding randomness."
                          },
                          {
                            code: "    'objective': 'binary:logistic',",
                            explanation: "This tells XGBoost what type of problem we're solving. 'binary:logistic' means we're classifying things into two categories (like yes/no, spam/not spam)."
                          },
                          {
                            code: "    'eval_metric': 'auc',",
                            explanation: "This is how we measure the model's performance during training. AUC measures how well the model can distinguish between the two classes."
                          },
                          {
                            code: "    'seed': 42",
                            explanation: "Setting a seed ensures we get the same results every time we run the code. It's like using the same starting point for randomness."
                          },
                          {
                            code: "}",
                            explanation: "This closes our parameters dictionary."
                          },
                          {
                            code: "# Create and train model",
                            explanation: "Now we'll create our XGBoost model and teach it using our training data."
                          },
                          {
                            code: "model = xgb.XGBClassifier(**params)",
                            explanation: "This creates an XGBoost classifier (a model that puts things into categories) using all the parameters we set above."
                          },
                          {
                            code: "model.fit(",
                            explanation: "The 'fit' function is like teaching the model. We show it examples and the correct answers so it can learn patterns."
                          },
                          {
                            code: "    X_train, y_train,",
                            explanation: "We give the model our training features (X_train) and the correct answers (y_train) to learn from."
                          },
                          {
                            code: "    eval_set=[(X_test, y_test)],",
                            explanation: "This gives the model some test data to check its progress during training, like practice tests while studying."
                          },
                          {
                            code: "    verbose=True",
                            explanation: "Verbose=True means the model will print updates while it's training, so we can see how it's doing."
                          },
                          {
                            code: ")",
                            explanation: "This closes the fit function call."
                          },
                          {
                            code: "# Make predictions",
                            explanation: "Now that our model is trained, let's use it to make predictions on new data."
                          },
                          {
                            code: "y_pred = model.predict(X_test)",
                            explanation: "This asks our trained model to make predictions on the test data. y_pred will contain the model's guesses."
                          },
                          {
                            code: "# Evaluate model",
                            explanation: "Let's check how well our model did by comparing its predictions to the correct answers."
                          },
                          {
                            code: "accuracy = accuracy_score(y_test, y_pred)",
                            explanation: "This calculates the accuracy by comparing the correct answers (y_test) with our model's predictions (y_pred). It gives us a percentage of correct predictions."
                          },
                          {
                            code: 'print(f"Accuracy: {accuracy:.4f}")',
                            explanation: "This prints the accuracy score to 4 decimal places. For example, 0.8500 means 85% of predictions were correct."
                          },
                          {
                            code: "# Feature importance",
                            explanation: "Let's see which input features (columns in our data) the model thinks are most important for making predictions."
                          },
                          {
                            code: "importance = model.feature_importances_",
                            explanation: "This gets a list of numbers showing how important each feature was for the model's decisions. Higher numbers mean more important features."
                          },
                          {
                            code: 'print("Feature Importance:", importance)',
                            explanation: "This prints the importance scores so we can see which features matter most to our model."
                          }
                        ])}
                      </div>
                    ) : (
                      <pre className="text-xs overflow-x-auto bg-background p-3 rounded">
{`import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import numpy as np

# Load and prepare data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Set hyperparameters
params = {
    'max_depth': ${xgbParams.maxDepth},
    'learning_rate': ${xgbParams.learningRate},
    'n_estimators': ${xgbParams.nEstimators},
    'subsample': ${xgbParams.subsample},
    'objective': 'binary:logistic',
    'eval_metric': 'auc',
    'seed': 42
}

# Create and train model
model = xgb.XGBClassifier(**params)
model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    verbose=True
)

# Make predictions
y_pred = model.predict(X_test)

# Evaluate model
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.4f}")

# Feature importance
importance = model.feature_importances_
print("Feature Importance:", importance)`}
                      </pre>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {xgbResult && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <h4 className="font-semibold">Model Evaluation Results</h4>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{((xgbResult.accuracy ?? 0) * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Accuracy</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{((xgbResult.precision ?? 0) * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Precision</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{((xgbResult.recall ?? 0) * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Recall</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{((xgbResult.f1Score ?? 0) * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">F1-Score</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h5 className="font-semibold mb-3">Feature Importance</h5>
                    <div className="space-y-2">
                      {(xgbResult.featureImportance ?? []).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-sm w-24">{item.feature}</span>
                          <div className="flex-1 bg-background rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${item.importance * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {(item.importance * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Model Predictions Scatter Plot */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3">Model Predictions vs Actual</h5>
                      <ResponsiveContainer width="100%" height={250}>
                        <ScatterChart data={xgbResult.chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="x" name="Feature Value" />
                          <YAxis dataKey="y" name="Target Value" />
                          <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-background p-2 border rounded shadow">
                                    <p className="text-sm">Actual: {data.y}</p>
                                    <p className="text-sm">Predicted: {data.predicted}</p>
                                    <p className="text-sm">Class: {data.class}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Scatter name="Actual" dataKey="y" fill="#3b82f6" />
                          <Scatter name="Predicted" dataKey="predicted" fill="#ef4444" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Training Performance */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3">Training Performance</h5>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={xgbResult.performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="epoch" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="accuracy" 
                            stroke="#22c55e" 
                            strokeWidth={2}
                            name="Accuracy"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="loss" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            name="Loss"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Training completed in {xgbResult.trainTime}s
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* k-NN Tab */}
        <TabsContent value="knn" className="space-y-4 animate-in fade-in-50 duration-500">
          <Card className="border-green-200 shadow-lg shadow-green-100/50 hover:shadow-xl hover:shadow-green-200/50 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 border-b border-green-200">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900">k-Nearest Neighbors</h3>
                  <p className="text-sm text-green-600 font-normal">Instance-Based Learning</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">
                  {knowledgeLevel <= 2 ? (
                    <>
                      <MLTermTooltip 
                        term="k-NN" 
                        definition="k-Nearest Neighbors - an algorithm that makes predictions by looking at the 'k' most similar examples in the training data"
                      /> is like asking your neighbors for advice! It looks at the '<MLTermTooltip 
                        term="k" 
                        definition="A number you choose that determines how many nearest neighbors to consider when making a prediction"
                      />' closest examples in your data and makes predictions based on what those similar examples did. If most of your <MLTermTooltip 
                        term="neighbors" 
                        definition="The most similar data points in the training set, determined by measuring distance in the feature space"
                      /> are one type, you're probably that type too.
                    </>
                  ) : knowledgeLevel <= 4 ? (
                    "k-NN is a simple, instance-based learning algorithm that stores all available cases and classifies new data points based on a similarity measure (e.g., distance functions). It's a non-parametric method that makes predictions based on the k nearest neighbors."
                  ) : (
                    "k-NN is a lazy learning algorithm that performs instance-based classification using distance metrics in feature space. It employs various distance functions (Euclidean, Manhattan, Minkowski) and weighting schemes (uniform, distance-based) to determine class membership through majority voting or weighted averaging of k-nearest neighbors."
                  )}
                </p>
              </div>

              {/* Interactive Hyperparameter Tuning */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <h4 className="font-semibold">Interactive Hyperparameter Tuning</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Number of Neighbors (k): {knnParams.nNeighbors}</Label>
                    <Slider
                      value={[knnParams.nNeighbors]}
                      onValueChange={(v: number[]) => setKnnParams({...knnParams, nNeighbors: v[0]})}
                      min={1}
                      max={20}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Weight Function</Label>
                    <select 
                      className="w-full p-2 rounded-md border bg-background"
                      value={knnParams.weights}
                      onChange={(e) => setKnnParams({...knnParams, weights: e.target.value})}
                    >
                      <option value="uniform">Uniform</option>
                      <option value="distance">Distance</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Algorithm</Label>
                    <select 
                      className="w-full p-2 rounded-md border bg-background"
                      value={knnParams.algorithm}
                      onChange={(e) => setKnnParams({...knnParams, algorithm: e.target.value})}
                    >
                      <option value="auto">Auto</option>
                      <option value="ball_tree">Ball Tree</option>
                      <option value="kd_tree">KD Tree</option>
                      <option value="brute">Brute Force</option>
                    </select>
                  </div>
                </div>

                <Button onClick={runKNN} disabled={knnLoading} className="w-full">
                  {knnLoading ? (
                    <>Training Model...</>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run k-NN Model
                    </>
                  )}
                </Button>
              </div>

              {/* Collapsible Python Code */}
              <Collapsible open={codeOpen.knn} onOpenChange={(open: boolean) => setCodeOpen({...codeOpen, knn: open})}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4" />
                      <span>View Python Implementation</span>
                    </div>
                    {codeOpen.knn ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Code2 className="h-4 w-4" />
                      <h4 className="font-semibold">Python Implementation</h4>
                      {knowledgeLevel <= 2 && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          <HelpCircle className="h-3 w-3" />
                          Hover over code lines for explanations
                        </div>
                      )}
                    </div>
                    {knowledgeLevel <= 2 ? (
                      <div className="bg-background p-3 rounded border space-y-0">
                        {renderBeginnerCode([
                          {
                            code: "from sklearn.neighbors import KNeighborsClassifier",
                            explanation: "This imports the k-NN algorithm from scikit-learn. k-NN stands for 'k-Nearest Neighbors' - it makes predictions by looking at the closest examples in the data."
                          },
                          {
                            code: "from sklearn.model_selection import train_test_split",
                            explanation: "This tool helps us split our data into training (for teaching) and testing (for checking how well it learned) parts."
                          },
                          {
                            code: "from sklearn.preprocessing import StandardScaler",
                            explanation: "StandardScaler makes all our features have similar scales. This is important for k-NN because it measures distances between data points."
                          },
                          {
                            code: "from sklearn.metrics import accuracy_score, confusion_matrix",
                            explanation: "These are tools to measure how good our model is. Accuracy shows percentage correct, confusion matrix shows what types of mistakes it made."
                          },
                          {
                            code: "import numpy as np",
                            explanation: "NumPy helps us work with numbers and arrays (lists of numbers) efficiently."
                          },
                          {
                            code: "# Prepare data",
                            explanation: "Let's get our data ready for the k-NN algorithm."
                          },
                          {
                            code: "X_train, X_test, y_train, y_test = train_test_split(",
                            explanation: "Split data into 4 parts: training features, test features, training labels (correct answers), test labels."
                          },
                          {
                            code: "    X, y, test_size=0.2, random_state=42",
                            explanation: "Use 80% for training, 20% for testing. random_state=42 ensures we get the same split every time."
                          },
                          {
                            code: ")",
                            explanation: "Closes the train_test_split function."
                          },
                          {
                            code: "# Scale features for better k-NN performance",
                            explanation: "k-NN works by measuring distances, so we need all features to be on similar scales (like converting feet and inches to the same unit)."
                          },
                          {
                            code: "scaler = StandardScaler()",
                            explanation: "Create a scaler that will make all features have mean=0 and standard deviation=1."
                          },
                          {
                            code: "X_train_scaled = scaler.fit_transform(X_train)",
                            explanation: "Learn the scaling from training data and apply it. 'fit' learns the scaling, 'transform' applies it."
                          },
                          {
                            code: "X_test_scaled = scaler.transform(X_test)",
                            explanation: "Apply the same scaling to test data (but don't learn from it - that would be cheating!)."
                          },
                          {
                            code: "# Set hyperparameters",
                            explanation: "Configure the settings for our k-NN model."
                          },
                          {
                            code: "params = {",
                            explanation: "Create a dictionary with our k-NN settings."
                          },
                          {
                            code: `    'n_neighbors': ${knnParams.nNeighbors},`,
                            explanation: "How many nearest neighbors to look at when making a prediction. More neighbors = smoother decisions but less detailed."
                          },
                          {
                            code: `    'weights': '${knnParams.weights}',`,
                            explanation: "How to weight the neighbors. 'uniform' means all neighbors vote equally, 'distance' means closer neighbors have more influence."
                          },
                          {
                            code: `    'algorithm': '${knnParams.algorithm}',`,
                            explanation: "Which algorithm to use for finding neighbors. 'auto' lets the computer choose the best one based on your data."
                          },
                          {
                            code: "    'metric': 'euclidean'",
                            explanation: "How to measure distance between points. Euclidean is like measuring with a ruler in straight lines."
                          },
                          {
                            code: "}",
                            explanation: "Closes our parameters dictionary."
                          },
                          {
                            code: "# Create and train model",
                            explanation: "Create our k-NN model and 'train' it (k-NN just remembers all the training data)."
                          },
                          {
                            code: "knn_model = KNeighborsClassifier(**params)",
                            explanation: "Create a k-NN classifier with our chosen parameters."
                          },
                          {
                            code: "knn_model.fit(X_train_scaled, y_train)",
                            explanation: "k-NN doesn't really 'learn' like other algorithms - it just stores all the training data to use later for comparisons."
                          },
                          {
                            code: "# Make predictions",
                            explanation: "Now use our model to make predictions on new data."
                          },
                          {
                            code: "y_pred = knn_model.predict(X_test_scaled)",
                            explanation: "For each test point, find the k nearest training points and predict based on their labels (like asking your k closest neighbors for advice)."
                          },
                          {
                            code: "# Evaluate model",
                            explanation: "Check how well our model performed."
                          },
                          {
                            code: "accuracy = accuracy_score(y_test, y_pred)",
                            explanation: "Calculate what percentage of predictions were correct."
                          },
                          {
                            code: "conf_matrix = confusion_matrix(y_test, y_pred)",
                            explanation: "Create a table showing what the model predicted vs. what was actually correct. Helps us see what types of mistakes it made."
                          },
                          {
                            code: 'print(f"Accuracy: {accuracy:.4f}")',
                            explanation: "Print the accuracy as a decimal (e.g., 0.8500 = 85% correct)."
                          },
                          {
                            code: 'print(f"Confusion Matrix:\\n{conf_matrix}")',
                            explanation: "Print the confusion matrix to see the detailed breakdown of correct and incorrect predictions."
                          }
                        ])}
                      </div>
                    ) : (
                      <pre className="text-xs overflow-x-auto bg-background p-3 rounded">
{`from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, confusion_matrix
import numpy as np

# Prepare data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features for better k-NN performance
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Set hyperparameters
params = {
    'n_neighbors': ${knnParams.nNeighbors},
    'weights': '${knnParams.weights}',
    'algorithm': '${knnParams.algorithm}',
    'metric': 'euclidean'
}

# Create and train model
knn_model = KNeighborsClassifier(**params)
knn_model.fit(X_train_scaled, y_train)

# Make predictions
y_pred = knn_model.predict(X_test_scaled)

# Evaluate model
accuracy = accuracy_score(y_test, y_pred)
conf_matrix = confusion_matrix(y_test, y_pred)

print(f"Accuracy: {accuracy:.4f}")
print(f"Confusion Matrix:\\n{conf_matrix}")`}
                      </pre>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {knnResult && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <h4 className="font-semibold">Model Evaluation Results</h4>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{((knnResult.accuracy ?? 0) * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Accuracy</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{((knnResult.precision ?? 0) * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Precision</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{((knnResult.recall ?? 0) * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Recall</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{((knnResult.f1Score ?? 0) * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">F1-Score</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h5 className="font-semibold mb-3">Confusion Matrix</h5>
                    <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                      {(knnResult.confusionMatrix ?? []).map((row: number[], i: number) => 
                        row.map((val: number, j: number) => (
                          <div 
                            key={`${i}-${j}`}
                            className="bg-background p-4 rounded text-center"
                            style={{
                              backgroundColor: i === j ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--destructive) / 0.1)'
                            }}
                          >
                            <div className="text-2xl font-bold">{val}</div>
                            <div className="text-xs text-muted-foreground">
                              {i === j ? 'True' : 'False'} {i === 0 ? 'Negative' : 'Positive'}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Interactive Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* k-NN Decision Regions */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3">k-NN Classification Regions</h5>
                      <ResponsiveContainer width="100%" height={250}>
                        <ScatterChart data={knnResult.chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="x" name="Feature 1" />
                          <YAxis dataKey="y" name="Feature 2" />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-background p-2 border rounded shadow">
                                    <p className="text-sm">Feature 1: {data.x}</p>
                                    <p className="text-sm">Feature 2: {data.y}</p>
                                    <p className="text-sm">Class: {data.class}</p>
                                    <p className="text-sm">k = {knnParams.nNeighbors}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Scatter 
                            name="Data Points" 
                            dataKey="y" 
                            fill="#3b82f6"
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3">Performance Over Training</h5>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={knnResult.performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="epoch" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="accuracy" 
                            stroke="#22c55e" 
                            strokeWidth={2}
                            name="Accuracy"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Training completed in {knnResult.trainTime}s
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Linear Learner Tab */}
        <TabsContent value="linear" className="space-y-4 animate-in fade-in-50 duration-500">
          <Card className="border-purple-200 shadow-lg shadow-purple-100/50 hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 border-b border-purple-200">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-900">Linear Learner</h3>
                  <p className="text-sm text-purple-600 font-normal">Linear Regression & Classification</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">
                  {knowledgeLevel <= 2 ? (
                    "Linear Learner tries to draw the best straight line (or flat surface) through your data points. It's like finding the line of best fit that you might remember from school math, but for making predictions about new data."
                  ) : knowledgeLevel <= 4 ? (
                    "Linear Learner is a supervised learning algorithm used for solving regression and classification problems. It learns a linear function that best fits the training data by minimizing a loss function through gradient descent optimization."
                  ) : (
                    "Linear Learner implements various linear models including logistic regression, linear regression, and multi-class classification using stochastic gradient descent (SGD) with L1/L2 regularization. It supports multiple solvers, learning rate schedules, and automatic hyperparameter tuning for optimal convergence."
                  )}
                </p>
              </div>

              {/* Interactive Hyperparameter Tuning */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <h4 className="font-semibold">Interactive Hyperparameter Tuning</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Learning Rate: {linearParams.learningRate}</Label>
                    <Slider
                      value={[linearParams.learningRate * 100]}
                      onValueChange={(v: number[]) => setLinearParams({...linearParams, learningRate: v[0] / 100})}
                      min={0.1}
                      max={10}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Epochs: {linearParams.epochs}</Label>
                    <Slider
                      value={[linearParams.epochs]}
                      onValueChange={(v: number[]) => setLinearParams({...linearParams, epochs: v[0]})}
                      min={10}
                      max={1000}
                      step={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Regularization (α): {linearParams.regularization}</Label>
                    <Slider
                      value={[linearParams.regularization * 100]}
                      onValueChange={(v: number[]) => setLinearParams({...linearParams, regularization: v[0] / 100})}
                      min={0.1}
                      max={10}
                      step={0.1}
                    />
                  </div>
                </div>

                <Button onClick={runLinear} disabled={linearLoading} className="w-full">
                  {linearLoading ? (
                    <>Training Model...</>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Linear Learner Model
                    </>
                  )}
                </Button>
              </div>

              {/* Collapsible Python Code */}
              <Collapsible open={codeOpen.linear} onOpenChange={(open: boolean) => setCodeOpen({...codeOpen, linear: open})}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4" />
                      <span>View Python Implementation</span>
                    </div>
                    {codeOpen.linear ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Code2 className="h-4 w-4" />
                      <h4 className="font-semibold">Python Implementation</h4>
                      {knowledgeLevel <= 2 && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          <HelpCircle className="h-3 w-3" />
                          Hover over code lines for explanations
                        </div>
                      )}
                    </div>
                    {knowledgeLevel <= 2 ? (
                      <div className="bg-background p-3 rounded border space-y-0">
                        {renderBeginnerCode([
                          {
                            code: "from sklearn.linear_model import SGDRegressor",
                            explanation: "This imports SGDRegressor, which uses Stochastic Gradient Descent to learn linear relationships. It's like teaching the computer to draw the best line through data points."
                          },
                          {
                            code: "from sklearn.model_selection import train_test_split",
                            explanation: "This tool helps us split our data into training (for teaching) and testing (for checking how well it learned) parts."
                          },
                          {
                            code: "from sklearn.preprocessing import StandardScaler",
                            explanation: "StandardScaler makes all features have similar scales (like converting different units to the same measurement system) so the algorithm works better."
                          },
                          {
                            code: "from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error",
                            explanation: "These are tools to measure how good our linear model is. They tell us how far off our predictions are from the actual values."
                          },
                          {
                            code: "import numpy as np",
                            explanation: "NumPy helps us work with numbers and arrays efficiently."
                          },
                          {
                            code: "# Prepare data",
                            explanation: "Let's get our data ready for the linear learning algorithm."
                          },
                          {
                            code: "X_train, X_test, y_train, y_test = train_test_split(",
                            explanation: "Split data into 4 parts: training features, test features, training targets (what we want to predict), test targets."
                          },
                          {
                            code: "    X, y, test_size=0.2, random_state=42",
                            explanation: "Use 80% for training, 20% for testing. random_state=42 ensures we get the same split every time."
                          },
                          {
                            code: ")",
                            explanation: "Closes the train_test_split function."
                          },
                          {
                            code: "# Scale features",
                            explanation: "Linear models work better when all features are on similar scales, so we normalize them."
                          },
                          {
                            code: "scaler_X = StandardScaler()",
                            explanation: "Create a scaler for input features (X) to make them have mean=0 and standard deviation=1."
                          },
                          {
                            code: "scaler_y = StandardScaler()",
                            explanation: "Create a separate scaler for target values (y) to normalize them too."
                          },
                          {
                            code: "X_train_scaled = scaler_X.fit_transform(X_train)",
                            explanation: "Learn the scaling from training features and apply it. This makes all features comparable."
                          },
                          {
                            code: "X_test_scaled = scaler_X.transform(X_test)",
                            explanation: "Apply the same scaling to test features (but don't learn from them - that would be cheating!)."
                          },
                          {
                            code: "y_train_scaled = scaler_y.fit_transform(y_train.reshape(-1, 1)).ravel()",
                            explanation: "Scale the target values too. reshape(-1, 1) makes it a column, ravel() flattens it back to a 1D array."
                          },
                          {
                            code: "# Set hyperparameters",
                            explanation: "Configure the settings for our linear learning model."
                          },
                          {
                            code: "params = {",
                            explanation: "Create a dictionary with our linear model settings."
                          },
                          {
                            code: "    'learning_rate': 'constant',",
                            explanation: "Keep the learning rate constant throughout training (don't change how fast it learns)."
                          },
                          {
                            code: `    'eta0': ${linearParams.learningRate},`,
                            explanation: "The actual learning rate value - how big steps the algorithm takes when learning. Smaller = more careful, larger = faster but riskier."
                          },
                          {
                            code: `    'max_iter': ${linearParams.epochs},`,
                            explanation: "Maximum number of passes through the data. More iterations = more learning opportunities but takes longer."
                          },
                          {
                            code: `    'alpha': ${linearParams.regularization},`,
                            explanation: "Regularization strength - prevents overfitting by penalizing overly complex models. Higher values = simpler models."
                          },
                          {
                            code: "    'penalty': 'l2',",
                            explanation: "Type of regularization. L2 penalty encourages smaller, more evenly distributed weights."
                          },
                          {
                            code: "    'random_state': 42",
                            explanation: "Ensures reproducible results by controlling randomness."
                          },
                          {
                            code: "}",
                            explanation: "Closes our parameters dictionary."
                          },
                          {
                            code: "# Create and train model",
                            explanation: "Create our linear model and train it on the data."
                          },
                          {
                            code: "linear_model = SGDRegressor(**params)",
                            explanation: "Create a linear regression model using Stochastic Gradient Descent with our chosen parameters."
                          },
                          {
                            code: "linear_model.fit(X_train_scaled, y_train_scaled)",
                            explanation: "Train the model by showing it the scaled training features and their corresponding target values."
                          },
                          {
                            code: "# Make predictions",
                            explanation: "Use our trained model to make predictions on new data."
                          },
                          {
                            code: "y_pred_scaled = linear_model.predict(X_test_scaled)",
                            explanation: "Get predictions from our model on the test data. These are still in scaled form."
                          },
                          {
                            code: "y_pred = scaler_y.inverse_transform(y_pred_scaled.reshape(-1, 1)).ravel()",
                            explanation: "Convert predictions back to original scale so we can compare them with actual values."
                          },
                          {
                            code: "# Evaluate model",
                            explanation: "Check how well our model performed by comparing predictions to actual values."
                          },
                          {
                            code: "mse = mean_squared_error(y_test, y_pred)",
                            explanation: "Mean Squared Error - average of squared differences between actual and predicted values. Lower is better."
                          },
                          {
                            code: "rmse = np.sqrt(mse)",
                            explanation: "Root Mean Squared Error - square root of MSE, in the same units as our target variable."
                          },
                          {
                            code: "r2 = r2_score(y_test, y_pred)",
                            explanation: "R² Score - how much of the variation in target values our model explains. 1.0 = perfect, 0.0 = no better than average."
                          },
                          {
                            code: "mae = mean_absolute_error(y_test, y_pred)",
                            explanation: "Mean Absolute Error - average absolute difference between actual and predicted values."
                          },
                          {
                            code: 'print(f"MSE: {mse:.4f}")',
                            explanation: "Print the Mean Squared Error to 4 decimal places."
                          },
                          {
                            code: 'print(f"RMSE: {rmse:.4f}")',
                            explanation: "Print the Root Mean Squared Error to 4 decimal places."
                          },
                          {
                            code: 'print(f"R² Score: {r2:.4f}")',
                            explanation: "Print the R² Score to 4 decimal places."
                          },
                          {
                            code: 'print(f"MAE: {mae:.4f}")',
                            explanation: "Print the Mean Absolute Error to 4 decimal places."
                          },
                          {
                            code: 'print(f"Weights: {linear_model.coef_}")',
                            explanation: "Print the learned weights (coefficients) that show how much each feature contributes to the prediction."
                          }
                        ])}
                      </div>
                    ) : (
                      <pre className="text-xs overflow-x-auto bg-background p-3 rounded">
{`from sklearn.linear_model import SGDRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import numpy as np

# Prepare data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features
scaler_X = StandardScaler()
scaler_y = StandardScaler()

X_train_scaled = scaler_X.fit_transform(X_train)
X_test_scaled = scaler_X.transform(X_test)
y_train_scaled = scaler_y.fit_transform(y_train.reshape(-1, 1)).ravel()

# Set hyperparameters
params = {
    'learning_rate': 'constant',
    'eta0': ${linearParams.learningRate},
    'max_iter': ${linearParams.epochs},
    'alpha': ${linearParams.regularization},
    'penalty': 'l2',
    'random_state': 42
}

# Create and train model
linear_model = SGDRegressor(**params)
linear_model.fit(X_train_scaled, y_train_scaled)

# Make predictions
y_pred_scaled = linear_model.predict(X_test_scaled)
y_pred = scaler_y.inverse_transform(y_pred_scaled.reshape(-1, 1)).ravel()

# Evaluate model
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)

print(f"MSE: {mse:.4f}")
print(f"RMSE: {rmse:.4f}")
print(f"R² Score: {r2:.4f}")
print(f"MAE: {mae:.4f}")
print(f"Weights: {linear_model.coef_}")`}
                      </pre>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {linearResult && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <h4 className="font-semibold">Model Evaluation Results</h4>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{(linearResult.mse ?? 0).toFixed(3)}</p>
                          <p className="text-xs text-muted-foreground">MSE</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{(linearResult.rmse ?? 0).toFixed(3)}</p>
                          <p className="text-xs text-muted-foreground">RMSE</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{((linearResult.r2Score ?? 0) * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">R² Score</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{(linearResult.mae ?? 0).toFixed(3)}</p>
                          <p className="text-xs text-muted-foreground">MAE</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h5 className="font-semibold mb-3">Model Weights</h5>
                    <div className="space-y-2">
                      {(linearResult.weights ?? []).map((weight: number, idx: number) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-sm w-24">Weight {idx + 1}</span>
                          <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1 bg-background rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${weight >= 0 ? 'bg-primary' : 'bg-destructive'}`}
                                style={{ width: `${Math.abs(weight) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-16 text-right">
                              {weight.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Linear Regression Line */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3">Linear Regression Fit</h5>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={linearResult.chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="x" name="Feature Value" />
                          <YAxis name="Target Value" />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-background p-2 border rounded shadow">
                                    <p className="text-sm">X: {data.x}</p>
                                    <p className="text-sm">Actual: {data.y}</p>
                                    <p className="text-sm">Predicted: {data.predicted}</p>
                                    <p className="text-sm">R² = {linearResult.r2Score}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="y" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name="Actual"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="predicted" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Predicted"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Training Convergence */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3">Training Convergence</h5>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={linearResult.performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="epoch" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="accuracy" 
                            stroke="#22c55e" 
                            strokeWidth={2}
                            name="R² Score"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="loss" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            name="MSE Loss"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Training completed in {linearResult.trainTime}s
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Random Forest Tab */}
        <TabsContent value="rf" className="space-y-4 animate-in fade-in-50 duration-500">
          <Card className="border-emerald-200 shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-b border-emerald-200">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">Random Forest</h3>
                  <p className="text-sm text-emerald-600 font-normal">Ensemble Decision Trees</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">
                  {knowledgeLevel <= 2 ? (
                    "Random Forest is like having a team of decision-makers (trees) who each give their opinion, then taking a vote to make the final decision. Having many 'trees' making decisions together usually gives better results than just one tree alone."
                  ) : knowledgeLevel <= 4 ? (
                    "Random Forest is an ensemble learning method that creates multiple decision trees during training and outputs the mode of classes (classification) or mean prediction (regression) of individual trees. It uses bootstrap sampling and random feature selection."
                  ) : (
                    "Random Forest implements bagging (bootstrap aggregating) with random subspace method, constructing multiple decorrelated decision trees using bootstrap samples and random feature subsets at each split. It provides built-in cross-validation through out-of-bag (OOB) error estimation and feature importance ranking."
                  )}
                </p>
              </div>

              {/* Interactive Hyperparameter Tuning */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <h4 className="font-semibold">Interactive Hyperparameter Tuning</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>N Estimators: {rfParams.nEstimators}</Label>
                    <Slider
                      value={[rfParams.nEstimators]}
                      onValueChange={(v: number[]) => setRfParams({...rfParams, nEstimators: v[0]})}
                      min={10}
                      max={500}
                      step={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Depth: {rfParams.maxDepth}</Label>
                    <Slider
                      value={[rfParams.maxDepth]}
                      onValueChange={(v: number[]) => setRfParams({...rfParams, maxDepth: v[0]})}
                      min={1}
                      max={30}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Min Samples Split: {rfParams.minSamplesSplit}</Label>
                    <Slider
                      value={[rfParams.minSamplesSplit]}
                      onValueChange={(v: number[]) => setRfParams({...rfParams, minSamplesSplit: v[0]})}
                      min={2}
                      max={20}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Features</Label>
                    <select 
                      className="w-full p-2 rounded-md border bg-background"
                      value={rfParams.maxFeatures}
                      onChange={(e) => setRfParams({...rfParams, maxFeatures: e.target.value})}
                    >
                      <option value="sqrt">Square Root</option>
                      <option value="log2">Log2</option>
                      <option value="None">All Features</option>
                    </select>
                  </div>
                </div>

                <Button onClick={runRandomForest} disabled={rfLoading} className="w-full">
                  {rfLoading ? (
                    <>Training Model...</>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Random Forest Model
                    </>
                  )}
                </Button>
              </div>

              {/* Collapsible Python Code */}
              <Collapsible open={codeOpen.rf} onOpenChange={(open: boolean) => setCodeOpen({...codeOpen, rf: open})}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4" />
                      <span>View Python Implementation</span>
                    </div>
                    {codeOpen.rf ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Code2 className="h-4 w-4" />
                      <h4 className="font-semibold">Python Implementation</h4>
                      {knowledgeLevel <= 2 && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          <HelpCircle className="h-3 w-3" />
                          Hover over code lines for explanations
                        </div>
                      )}
                    </div>
                    {knowledgeLevel <= 2 ? (
                      <div className="bg-background p-3 rounded border space-y-0">
                        {renderBeginnerCode([
                          {
                            code: "from sklearn.ensemble import RandomForestClassifier",
                            explanation: "This imports Random Forest from the ensemble module. Ensemble means combining multiple models (trees) to make better predictions together."
                          },
                          {
                            code: "from sklearn.model_selection import train_test_split",
                            explanation: "This tool helps us split our data into training (for teaching) and testing (for checking performance) parts."
                          },
                          {
                            code: "from sklearn.metrics import accuracy_score, classification_report",
                            explanation: "These are tools to measure how good our Random Forest is at classifying things into different categories."
                          },
                          {
                            code: "import numpy as np",
                            explanation: "NumPy helps us work with numbers and arrays efficiently."
                          },
                          {
                            code: "# Prepare data",
                            explanation: "Let's get our data ready for the Random Forest algorithm."
                          },
                          {
                            code: "X_train, X_test, y_train, y_test = train_test_split(",
                            explanation: "Split data into 4 parts: training features, test features, training labels (correct categories), test labels."
                          },
                          {
                            code: "    X, y, test_size=0.2, random_state=42",
                            explanation: "Use 80% for training, 20% for testing. random_state=42 ensures we get the same split every time."
                          },
                          {
                            code: ")",
                            explanation: "Closes the train_test_split function."
                          },
                          {
                            code: "# Set hyperparameters",
                            explanation: "Configure the settings for our Random Forest - how many trees, how deep they can grow, etc."
                          },
                          {
                            code: "params = {",
                            explanation: "Create a dictionary with our Random Forest settings."
                          },
                          {
                            code: `    'n_estimators': ${rfParams.nEstimators},`,
                            explanation: "Number of decision trees in our forest. More trees usually mean better predictions but take longer to train."
                          },
                          {
                            code: `    'max_depth': ${rfParams.maxDepth},`,
                            explanation: "Maximum depth each tree can grow. Deeper trees can learn more complex patterns but might overfit."
                          },
                          {
                            code: `    'min_samples_split': ${rfParams.minSamplesSplit},`,
                            explanation: "Minimum number of samples needed to split a node. Higher values prevent overfitting by requiring more evidence before making splits."
                          },
                          {
                            code: `    'max_features': '${rfParams.maxFeatures}',`,
                            explanation: "How many features each tree considers when making splits. 'sqrt' means square root of total features, adding randomness."
                          },
                          {
                            code: "    'random_state': 42,",
                            explanation: "Ensures reproducible results by controlling randomness in tree building."
                          },
                          {
                            code: "    'oob_score': True",
                            explanation: "Out-of-bag score - uses data not seen by each tree to estimate performance without needing a separate validation set."
                          },
                          {
                            code: "}",
                            explanation: "Closes our parameters dictionary."
                          },
                          {
                            code: "# Create and train model",
                            explanation: "Create our Random Forest and train it by building many decision trees."
                          },
                          {
                            code: "rf_model = RandomForestClassifier(**params)",
                            explanation: "Create a Random Forest classifier with our chosen parameters."
                          },
                          {
                            code: "rf_model.fit(X_train, y_train)",
                            explanation: "Train the forest by building multiple decision trees, each learning from a random subset of the training data."
                          },
                          {
                            code: "# Make predictions",
                            explanation: "Use our trained forest to make predictions - each tree votes and the majority wins."
                          },
                          {
                            code: "y_pred = rf_model.predict(X_test)",
                            explanation: "Get predictions by having all trees in the forest vote on each test sample."
                          },
                          {
                            code: "# Evaluate model",
                            explanation: "Check how well our Random Forest performed."
                          },
                          {
                            code: "accuracy = accuracy_score(y_test, y_pred)",
                            explanation: "Calculate what percentage of predictions were correct."
                          },
                          {
                            code: "oob_score = rf_model.oob_score_",
                            explanation: "Get the out-of-bag score - an estimate of performance using data each tree didn't see during training."
                          },
                          {
                            code: 'print(f"Accuracy: {accuracy:.4f}")',
                            explanation: "Print the accuracy as a decimal (e.g., 0.8500 = 85% correct)."
                          },
                          {
                            code: 'print(f"OOB Score: {oob_score:.4f}")',
                            explanation: "Print the out-of-bag score, which is like a built-in validation score."
                          },
                          {
                            code: "# Feature importance",
                            explanation: "See which input features the forest thinks are most important for making predictions."
                          },
                          {
                            code: "importance = rf_model.feature_importances_",
                            explanation: "Get importance scores showing how much each feature contributed to the forest's decisions."
                          },
                          {
                            code: 'print("Feature Importance:", importance)',
                            explanation: "Print the importance scores so we can see which features matter most."
                          }
                        ])}
                      </div>
                    ) : (
                      <pre className="text-xs overflow-x-auto bg-background p-3 rounded">
{`from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import numpy as np

# Prepare data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Set hyperparameters
params = {
    'n_estimators': ${rfParams.nEstimators},
    'max_depth': ${rfParams.maxDepth},
    'min_samples_split': ${rfParams.minSamplesSplit},
    'max_features': '${rfParams.maxFeatures}',
    'random_state': 42,
    'oob_score': True
}

# Create and train model
rf_model = RandomForestClassifier(**params)
rf_model.fit(X_train, y_train)

# Make predictions
y_pred = rf_model.predict(X_test)

# Evaluate model
accuracy = accuracy_score(y_test, y_pred)
oob_score = rf_model.oob_score_

print(f"Accuracy: {accuracy:.4f}")
print(f"OOB Score: {oob_score:.4f}")

# Feature importance
importance = rf_model.feature_importances_
print("Feature Importance:", importance)`}
                      </pre>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {rfResult && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <h4 className="font-semibold">Model Evaluation Results</h4>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{((rfResult.accuracy ?? 0) * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Accuracy</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{((rfResult.precision ?? 0) * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Precision</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{((rfResult.recall ?? 0) * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Recall</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{((rfResult.oobScore ?? 0) * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">OOB Score</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h5 className="font-semibold mb-3">Feature Importance</h5>
                    <div className="space-y-2">
                      {(rfResult.featureImportance ?? []).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-sm w-24">{item.feature}</span>
                          <div className="flex-1 bg-background rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${item.importance * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {(item.importance * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Feature Importance Bar Chart */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3">Feature Importance Distribution</h5>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={rfResult.featureImportance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="feature" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Importance']}
                          />
                          <Bar dataKey="importance" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Random Forest Ensemble Predictions */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3">Ensemble Predictions</h5>
                      <ResponsiveContainer width="100%" height={250}>
                        <ScatterChart data={rfResult.chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="x" name="Feature Value" />
                          <YAxis dataKey="y" name="Prediction" />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-background p-2 border rounded shadow">
                                    <p className="text-sm">Feature: {data.x}</p>
                                    <p className="text-sm">Actual: {data.y}</p>
                                    <p className="text-sm">Ensemble: {data.predicted}</p>
                                    <p className="text-sm">Trees: {rfParams.nEstimators}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Scatter name="Actual" dataKey="y" fill="#3b82f6" />
                          <Scatter name="Predicted" dataKey="predicted" fill="#22c55e" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Training completed in {rfResult.trainTime}s
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SVM Tab */}
        <TabsContent value="svm" className="space-y-4 animate-in fade-in-50 duration-500">
          <Card className="border-orange-200 shadow-lg shadow-orange-100/50 hover:shadow-xl hover:shadow-orange-200/50 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 border-b border-orange-200">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-orange-900">Support Vector Machine</h3>
                  <p className="text-sm text-orange-600 font-normal">Maximum Margin Classifier</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">
                  {knowledgeLevel <= 2 ? (
                    "SVM tries to find the best boundary line (or surface) that separates different groups in your data. It's like drawing a fence that keeps different types of data points on their own sides, with the biggest possible gap between them."
                  ) : knowledgeLevel <= 4 ? (
                    "SVM is a powerful supervised learning algorithm used for classification and regression. It finds the optimal hyperplane that maximally separates different classes in the feature space using support vectors and kernel functions."
                  ) : (
                    "SVM solves the quadratic optimization problem to find the maximum-margin hyperplane using support vectors. It employs kernel trick (RBF, polynomial, sigmoid) to map data into higher-dimensional spaces, handles non-linear decision boundaries, and uses regularization parameter C to balance margin maximization with classification errors."
                  )}
                </p>
              </div>

              {/* Interactive Hyperparameter Tuning */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <h4 className="font-semibold">Interactive Hyperparameter Tuning</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kernel Type</Label>
                    <select 
                      className="w-full p-2 rounded-md border bg-background"
                      value={svmParams.kernel}
                      onChange={(e) => setSvmParams({...svmParams, kernel: e.target.value})}
                    >
                      <option value="rbf">RBF (Radial Basis Function)</option>
                      <option value="linear">Linear</option>
                      <option value="poly">Polynomial</option>
                      <option value="sigmoid">Sigmoid</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>C (Regularization): {svmParams.c}</Label>
                    <Slider
                      value={[svmParams.c * 10]}
                      onValueChange={(v: number[]) => setSvmParams({...svmParams, c: v[0] / 10})}
                      min={1}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gamma</Label>
                    <select 
                      className="w-full p-2 rounded-md border bg-background"
                      value={svmParams.gamma}
                      onChange={(e) => setSvmParams({...svmParams, gamma: e.target.value})}
                    >
                      <option value="scale">Scale</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>

                <Button onClick={runSVM} disabled={svmLoading} className="w-full">
                  {svmLoading ? (
                    <>Training Model...</>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run SVM Model
                    </>
                  )}
                </Button>
              </div>

              {/* Collapsible Python Code */}
              <Collapsible open={codeOpen.svm} onOpenChange={(open: boolean) => setCodeOpen({...codeOpen, svm: open})}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4" />
                      <span>View Python Implementation</span>
                    </div>
                    {codeOpen.svm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Code2 className="h-4 w-4" />
                      <h4 className="font-semibold">Python Implementation</h4>
                      {knowledgeLevel <= 2 && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          <HelpCircle className="h-3 w-3" />
                          Hover over code lines for explanations
                        </div>
                      )}
                    </div>
                    {knowledgeLevel <= 2 ? (
                      <div className="bg-background p-3 rounded border space-y-0">
                        {renderBeginnerCode([
                          {
                            code: "from sklearn.svm import SVC",
                            explanation: "This imports Support Vector Classifier (SVC), which finds the best boundary line to separate different classes of data."
                          },
                          {
                            code: "from sklearn.model_selection import train_test_split",
                            explanation: "This tool helps us split our data into training (for teaching) and testing (for checking performance) parts."
                          },
                          {
                            code: "from sklearn.preprocessing import StandardScaler",
                            explanation: "SVM is very sensitive to feature scales, so we need to normalize all features to have similar ranges."
                          },
                          {
                            code: "from sklearn.metrics import accuracy_score, classification_report",
                            explanation: "These are tools to measure how good our SVM is at classifying data into different categories."
                          },
                          {
                            code: "import numpy as np",
                            explanation: "NumPy helps us work with numbers and arrays efficiently."
                          },
                          {
                            code: "# Prepare data",
                            explanation: "Let's get our data ready for the SVM algorithm."
                          },
                          {
                            code: "X_train, X_test, y_train, y_test = train_test_split(",
                            explanation: "Split data into 4 parts: training features, test features, training labels (correct categories), test labels."
                          },
                          {
                            code: "    X, y, test_size=0.2, random_state=42",
                            explanation: "Use 80% for training, 20% for testing. random_state=42 ensures we get the same split every time."
                          },
                          {
                            code: ")",
                            explanation: "Closes the train_test_split function."
                          },
                          {
                            code: "# Scale features (important for SVM)",
                            explanation: "SVM measures distances between points, so all features must be on similar scales or some will dominate others."
                          },
                          {
                            code: "scaler = StandardScaler()",
                            explanation: "Create a scaler that will make all features have mean=0 and standard deviation=1."
                          },
                          {
                            code: "X_train_scaled = scaler.fit_transform(X_train)",
                            explanation: "Learn the scaling from training data and apply it. This makes all features comparable."
                          },
                          {
                            code: "X_test_scaled = scaler.transform(X_test)",
                            explanation: "Apply the same scaling to test data (but don't learn from it - that would be cheating!)."
                          },
                          {
                            code: "# Set hyperparameters",
                            explanation: "Configure the settings for our SVM - what type of boundary, how strict to be, etc."
                          },
                          {
                            code: "params = {",
                            explanation: "Create a dictionary with our SVM settings."
                          },
                          {
                            code: `    'kernel': '${svmParams.kernel}',`,
                            explanation: "Kernel type determines the shape of decision boundary. 'rbf' creates curved boundaries, 'linear' creates straight lines."
                          },
                          {
                            code: `    'C': ${svmParams.c},`,
                            explanation: "Regularization parameter. Higher C = stricter boundary (less tolerance for errors), lower C = more flexible boundary."
                          },
                          {
                            code: `    'gamma': '${svmParams.gamma}',`,
                            explanation: "Controls how far the influence of each training point reaches. 'scale' automatically adjusts based on features."
                          },
                          {
                            code: "    'random_state': 42",
                            explanation: "Ensures reproducible results by controlling randomness."
                          },
                          {
                            code: "}",
                            explanation: "Closes our parameters dictionary."
                          },
                          {
                            code: "# Create and train model",
                            explanation: "Create our SVM and train it to find the optimal decision boundary."
                          },
                          {
                            code: "svm_model = SVC(**params)",
                            explanation: "Create a Support Vector Classifier with our chosen parameters."
                          },
                          {
                            code: "svm_model.fit(X_train_scaled, y_train)",
                            explanation: "Train the SVM by finding the optimal hyperplane that best separates the classes using support vectors."
                          },
                          {
                            code: "# Make predictions",
                            explanation: "Use our trained SVM to classify new data points based on which side of the boundary they fall."
                          },
                          {
                            code: "y_pred = svm_model.predict(X_test_scaled)",
                            explanation: "Get predictions by seeing which side of the decision boundary each test point falls on."
                          },
                          {
                            code: "# Evaluate model",
                            explanation: "Check how well our SVM performed."
                          },
                          {
                            code: "accuracy = accuracy_score(y_test, y_pred)",
                            explanation: "Calculate what percentage of predictions were correct."
                          },
                          {
                            code: "n_support_vectors = svm_model.n_support_",
                            explanation: "Get the number of support vectors - the critical data points that define the decision boundary."
                          },
                          {
                            code: 'print(f"Accuracy: {accuracy:.4f}")',
                            explanation: "Print the accuracy as a decimal (e.g., 0.8500 = 85% correct)."
                          },
                          {
                            code: 'print(f"Support Vectors: {n_support_vectors}")',
                            explanation: "Print how many support vectors were used - fewer usually means a simpler, more generalizable model."
                          },
                          {
                            code: 'print(f"\\nClassification Report:\\n{classification_report(y_test, y_pred)}")',
                            explanation: "Print detailed performance metrics including precision, recall, and F1-score for each class."
                          }
                        ])}
                      </div>
                    ) : (
                      <pre className="text-xs overflow-x-auto bg-background p-3 rounded">
{`from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import numpy as np

# Prepare data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features (important for SVM)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Set hyperparameters
params = {
    'kernel': '${svmParams.kernel}',
    'C': ${svmParams.c},
    'gamma': '${svmParams.gamma}',
    'random_state': 42
}

# Create and train model
svm_model = SVC(**params)
svm_model.fit(X_train_scaled, y_train)

# Make predictions
y_pred = svm_model.predict(X_test_scaled)

# Evaluate model
accuracy = accuracy_score(y_test, y_pred)
n_support_vectors = svm_model.n_support_

print(f"Accuracy: {accuracy:.4f}")
print(f"Support Vectors: {n_support_vectors}")
print(f"\\nClassification Report:\\n{classification_report(y_test, y_pred)}")`}
                      </pre>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {svmResult && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <h4 className="font-semibold">Model Evaluation Results</h4>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{((svmResult.accuracy ?? 0) * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Accuracy</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{((svmResult.precision ?? 0) * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Precision</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{((svmResult.recall ?? 0) * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Recall</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{svmResult.supportVectors}</p>
                          <p className="text-xs text-muted-foreground">Support Vectors</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h5 className="font-semibold mb-3">Model Insights</h5>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Kernel: <span className="text-foreground font-medium">{svmParams.kernel.toUpperCase()}</span></p>
                      <p>• C Parameter: <span className="text-foreground font-medium">{svmParams.c}</span></p>
                      <p>• Support Vectors: <span className="text-foreground font-medium">{svmResult.supportVectors}</span> data points</p>
                      <p className="mt-3 text-xs">
                        The SVM model identified {svmResult.supportVectors} critical data points (support vectors) 
                        that define the decision boundary between classes.
                      </p>
                    </div>
                  </div>

                  {/* Interactive Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* SVM Decision Boundary */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3">SVM Decision Boundary</h5>
                      <ResponsiveContainer width="100%" height={250}>
                        <ScatterChart data={svmResult.chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="x" name="Feature 1" />
                          <YAxis dataKey="y" name="Feature 2" />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-background p-2 border rounded shadow">
                                    <p className="text-sm">Feature 1: {data.x}</p>
                                    <p className="text-sm">Feature 2: {data.y}</p>
                                    <p className="text-sm">Class: {data.class}</p>
                                    <p className="text-sm">Kernel: {svmParams.kernel}</p>
                                    <p className="text-sm">C: {svmParams.c}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Scatter 
                            name="Class A" 
                            dataKey="y" 
                            fill="#3b82f6"
                          />
                          <Scatter 
                            name="Class B" 
                            dataKey="predicted" 
                            fill="#ef4444"
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Support Vector Analysis */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3">Support Vector Analysis</h5>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Support Vectors', value: svmResult.supportVectors, fill: '#3b82f6' },
                              { name: 'Other Points', value: 500 - (svmResult.supportVectors ?? 0), fill: '#e5e7eb' }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#3b82f6" />
                            <Cell fill="#e5e7eb" />
                          </Pie>
                          <Tooltip 
                            formatter={(value: any, name: any) => [
                              `${value} points (${((value / 500) * 100).toFixed(1)}%)`, 
                              name
                            ]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Training completed in {svmResult.trainTime}s
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Section */}
      <footer className="mt-16 border-t bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-sm">Developed by</span>
                <span className="font-semibold text-blue-600">Ahmad Ziyad</span>
              </div>
              
              <a 
                href="https://www.linkedin.com/in/ahmadziyad/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
              
              <a 
                href="https://portfolio-ahmad-ten.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                Portfolio
              </a>
            </div>
            
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
              <p>© 2024 Interactive AL ML Learning Hub. Built with React, TypeScript, and Tailwind CSS.</p>
            </div>
          </div>
        </div>
      </footer>
      </div>
      </div>
    </div>
  );
};

export default MLShowcase;
