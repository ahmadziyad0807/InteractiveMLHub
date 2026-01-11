import { useState, useEffect } from "react";
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
import SecurityUtils from '@/lib/security';

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
  // Knowledge level state - Hidden for future use (defaulting to intermediate level)
  const knowledgeLevel = 3; // Default to intermediate level

  // Navigation and UI state - moved up to be available for other state initializations
  const [activeNavItem, setActiveNavItem] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Collapsible state for code sections
  const [codeOpen, setCodeOpen] = useState({
    xgboost: false,
    knn: false,
    linear: false,
    rf: false,
    svm: false
  });

  // Collapsible state for ML Pipelines section - controlled by navigation
  const [mlPipelinesOpen, setMlPipelinesOpen] = useState(activeNavItem === 'pipelines');

  // Collapsible state for ML Production-Ready Pipelines sub-section
  const [mlProductionPipelinesOpen, setMlProductionPipelinesOpen] = useState(activeNavItem === 'pipelines');

  // Collapsible states for individual code examples in ML Production-Ready Pipelines
  const [productionCodeOpen, setProductionCodeOpen] = useState({
    sklearn: false,
    mlflow: false,
    docker: false
  });

  // Collapsible state for AWS ML Pipelines section
  const [awsPipelinesOpen, setAwsPipelinesOpen] = useState(activeNavItem === 'pipelines');

  // Collapsible state for MLflow ML Pipelines section
  const [mlflowPipelinesOpen, setMlflowPipelinesOpen] = useState(false);

  // Collapsible state for MLOps Implementation Steps
  const [mlopsImplementationOpen, setMlopsImplementationOpen] = useState(false);

  // Collapsible states for MLflow code examples
  const [mlflowCodeOpen, setMlflowCodeOpen] = useState({
    setup: false,
    tracking: false,
    pipeline: false,
    deployment: false,
    monitoring: false
  });

  // Collapsible state for ML Algorithms section - controlled by navigation
  const [mlAlgorithmsOpen, setMlAlgorithmsOpen] = useState(activeNavItem === 'algorithms');

  // Collapsible states for ML Learning Types
  const [supervisedLearningOpen, setSupervisedLearningOpen] = useState(false);
  const [unsupervisedLearningOpen, setUnsupervisedLearningOpen] = useState(false);
  const [reinforcementLearningOpen, setReinforcementLearningOpen] = useState(false);

  // Collapsible state for RAG section - controlled by navigation
  const [ragOpen, setRagOpen] = useState(activeNavItem === 'rag');

  // Document upload and chat state for AI Chatbot section
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentChatOpen, setDocumentChatOpen] = useState(false);

  // Collapsible state for AI Chatbot section - controlled by navigation
  const [chatbotOpen, setChatbotOpen] = useState(activeNavItem === 'chatbot');

  // Collapsible state for MLOps section - controlled by navigation
  const [mlopsOpen, setMlopsOpen] = useState(activeNavItem === 'mlops');

  // Collapsible states for MLOps sub-sections - Hidden for future use
  // const [mlopsCodeOpen, setMlopsCodeOpen] = useState({
  //   cicd: false,
  //   monitoring: false,
  //   deployment: false,
  //   testing: false
  // });

  // Collapsible states for Chatbot sub-sections - Hidden for future use
  // const [chatbotCodeOpen, setChatbotCodeOpen] = useState({
  //   basic: false,
  //   advanced: false,
  //   deployment: false,
  //   integration: false
  // });

  // Handle navigation changes to control section visibility
  useEffect(() => {
    // Update section visibility based on active navigation item
    setMlPipelinesOpen(activeNavItem === 'pipelines');
    setMlProductionPipelinesOpen(activeNavItem === 'pipelines');
    setAwsPipelinesOpen(activeNavItem === 'pipelines');
    setMlflowPipelinesOpen(activeNavItem === 'mlops');
    setMlopsImplementationOpen(activeNavItem === 'mlops');
    setMlAlgorithmsOpen(activeNavItem === 'algorithms');
    // Keep learning type sections initially closed - they open independently
    // setSupervisedLearningOpen(activeNavItem === 'algorithms');
    // setUnsupervisedLearningOpen(activeNavItem === 'algorithms');
    // setReinforcementLearningOpen(activeNavItem === 'algorithms');
    setRagOpen(activeNavItem === 'rag');
    setChatbotOpen(activeNavItem === 'chatbot');
    setMlopsOpen(activeNavItem === 'mlops');
  }, [activeNavItem]);

  // Secure search handler
  const handleSearchChange = (value: string) => {
    // Validate and sanitize search input
    const searchValidation = SecurityUtils.validateInput(value, 100); // 100 char limit for search
    if (searchValidation.isValid) {
      setSearchQuery(searchValidation.sanitized);
    } else {
      // For search, we'll be more lenient and just sanitize without showing errors
      setSearchQuery(SecurityUtils.sanitizeHtml(value.substring(0, 100)));
    }
  };

  // Navigation and UI state

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

  // Image upload functions - Moved to RAG section

  // Document upload and processing functions for RAG
  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processDocumentFile(file);
    }
  };

  const processDocumentFile = (file: File) => {
    // Use security utilities for file validation
    const fileValidation = SecurityUtils.validateFileUpload(file);
    
    if (!fileValidation.isValid) {
      alert(`File validation failed: ${fileValidation.errors.join(', ')}`);
      return;
    }
    
    setUploadedDocument(file);
    setIsProcessing(true);
    
    // Extract text content from file
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      if (file.type === 'text/plain') {
        // Validate and sanitize content
        const contentValidation = SecurityUtils.validateInput(content, 50000); // 50KB max content
        if (!contentValidation.isValid) {
          alert(`Content validation failed: ${contentValidation.errors.join(', ')}`);
          setIsProcessing(false);
          return;
        }
        setDocumentContent(contentValidation.sanitized);
      } else {
        // For PDF and Word files, we'll use a simplified text extraction
        // In a real implementation, you'd use libraries like pdf-parse, mammoth, etc.
        const safeFileName = SecurityUtils.sanitizeHtml(file.name);
        setDocumentContent(`Document "${safeFileName}" uploaded successfully. Content extraction for ${file.type} files would require additional libraries in a production environment.`);
      }
      
      setIsProcessing(false);
      setDocumentChatOpen(true);
      
      // Add welcome message with sanitized file name
      const safeFileName = SecurityUtils.sanitizeHtml(file.name);
      setChatMessages([{
        role: 'assistant',
        content: `Hello! I've processed your document "${safeFileName}". You can now ask me questions about its content. What would you like to know?`
      }]);
    };
    
    reader.readAsText(file);
  };

  // Drag and drop handlers for documents
  const handleDocumentDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDocumentDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      processDocumentFile(files[0]);
    }
  };

  // Simple RAG chat function (frontend-only simulation)
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !documentContent) return;
    
    const userMessage = currentMessage.trim();
    
    // Validate and sanitize user input
    const messageValidation = SecurityUtils.validateInput(userMessage, 500); // 500 char limit for messages
    if (!messageValidation.isValid) {
      alert(`Message validation failed: ${messageValidation.errors.join(', ')}`);
      return;
    }
    
    // Check rate limiting
    const rateLimitCheck = SecurityUtils.checkRateLimit('chat_messages');
    if (!rateLimitCheck.allowed) {
      alert(`Rate limit exceeded. Please wait before sending another message. Remaining requests: ${rateLimitCheck.remainingRequests}`);
      return;
    }
    
    const sanitizedMessage = messageValidation.sanitized;
    setCurrentMessage('');
    
    // Add user message
    const newMessages = [...chatMessages, { role: 'user' as const, content: sanitizedMessage }];
    setChatMessages(newMessages);
    
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      // Simple keyword-based response simulation
      // In a real implementation, this would use LangChain with an open-source LLM
      let response = generateSimpleResponse(sanitizedMessage, documentContent);
      
      setChatMessages([...newMessages, { role: 'assistant' as const, content: response }]);
      setIsProcessing(false);
    }, 1500);
  };

  // Simple response generation (simulates LLM processing)
  const generateSimpleResponse = (question: string, content: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    // Simple keyword matching and response generation
    if (lowerQuestion.includes('summary') || lowerQuestion.includes('summarize')) {
      return `Based on the document, here's a summary: The document contains ${content.length} characters of text. Key topics appear to be related to the main themes discussed in the content.`;
    }
    
    if (lowerQuestion.includes('what') || lowerQuestion.includes('explain')) {
      const sentences = content.split('.').slice(0, 3);
      return `According to the document: ${sentences.join('. ')}...`;
    }
    
    if (lowerQuestion.includes('how many') || lowerQuestion.includes('count')) {
      const words = content.split(' ').length;
      return `The document contains approximately ${words} words and ${content.length} characters.`;
    }
    
    // Default response with context
    const relevantPart = findRelevantContent(lowerQuestion, content);
    return `Based on your question about "${question}", here's what I found in the document: ${relevantPart}`;
  };

  // Find relevant content based on keywords
  const findRelevantContent = (question: string, content: string): string => {
    const keywords = question.split(' ').filter(word => word.length > 3);
    const sentences = content.split('.');
    
    for (const sentence of sentences) {
      for (const keyword of keywords) {
        if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
          return sentence.trim() + '.';
        }
      }
    }
    
    return sentences[0] || 'I found relevant information in the document, but need more specific questions to provide detailed answers.';
  };

  // Remove uploaded document
  const removeDocument = () => {
    setUploadedDocument(null);
    setDocumentContent('');
    setChatMessages([]);
    setDocumentChatOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100">
      {/* Enhanced Header with Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between py-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <Brain className="h-10 w-10 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Interactive AL ML Learning Hub
                </h1>
                <p className="text-xs text-gray-600">Explore • Learn • Implement</p>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-4">
              {/* Search Field */}
              <div className="relative">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                {showSearch && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search algorithms, concepts, or features..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    {searchQuery && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs text-gray-500 font-medium">Quick Results:</div>
                        <div className="space-y-1">
                          {['XGBoost', 'Random Forest', 'SVM', 'k-NN', 'Linear Learner'].filter(item => 
                            item.toLowerCase().includes(searchQuery.toLowerCase())
                          ).map(item => (
                            <div key={item} className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded cursor-pointer">
                              {item} Algorithm
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Get Started
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="border-t border-gray-100">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-8">
                <button
                  onClick={() => setActiveNavItem('home')}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeNavItem === 'home' 
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setActiveNavItem('algorithms')}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeNavItem === 'algorithms' 
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  ML Algorithms
                </button>
                <button
                  onClick={() => setActiveNavItem('pipelines')}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeNavItem === 'pipelines' 
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  ML Pipelines
                </button>
                <button
                  onClick={() => setActiveNavItem('rag')}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeNavItem === 'rag' 
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  RAG Systems
                </button>
                <button
                  onClick={() => setActiveNavItem('chatbot')}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeNavItem === 'chatbot' 
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  AI Chatbot
                </button>
                <button
                  onClick={() => setActiveNavItem('mlops')}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeNavItem === 'mlops' 
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  MLOps
                </button>
                <button
                  onClick={() => setActiveNavItem('resources')}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeNavItem === 'resources' 
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Resources
                </button>
              </div>

              {/* Breadcrumbs */}
              <div className="flex items-center text-xs text-gray-500">
                <span>Home</span>
                <svg className="w-3 h-3 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-blue-600 font-medium">
                  {activeNavItem === 'home' && 'Home'}
                  {activeNavItem === 'algorithms' && 'ML Algorithms'}
                  {activeNavItem === 'pipelines' && 'ML Pipelines'}
                  {activeNavItem === 'rag' && 'RAG Systems'}
                  {activeNavItem === 'chatbot' && 'AI Chatbot'}
                  {activeNavItem === 'mlops' && 'MLOps'}
                  {activeNavItem === 'resources' && 'Resources'}
                </span>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="space-y-6">
        
        {/* Home/Landing Page - Show when home nav is active */}
        {activeNavItem === 'home' && (
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-3">
            {/* Hero Section */}
            <div className="text-center mb-4">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-md">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Interactive AL ML Learning Hub
              </h1>
              
              <p className="text-sm text-gray-700 mb-3 max-w-2xl mx-auto">
                Your platform for exploring 
                <span className="font-semibold text-blue-600"> AI</span> and 
                <span className="font-semibold text-purple-600"> ML</span> technologies
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2 justify-center items-center mb-4">
                <button 
                  onClick={() => setActiveNavItem('algorithms')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Start Learning
                </button>
                <button 
                  onClick={() => setActiveNavItem('pipelines')}
                  className="border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200"
                >
                  Explore Pipelines
                </button>
              </div>
            </div>

            {/* Features Overview */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-center text-gray-800 mb-3">
                🚀 What You'll Discover
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {/* ML Algorithms Card */}
                <div 
                  onClick={() => setActiveNavItem('algorithms')}
                  className="bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-300 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-105"
                >
                  <div className="flex items-center gap-1 mb-2">
                    <div className="p-1 bg-indigo-600 rounded">
                      <BarChart3 className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-indigo-900">ML Algorithms</h3>
                  </div>
                  <p className="text-indigo-700 text-xs mb-2">
                    Interactive exploration of 5 ML algorithms.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-1 py-0.5 bg-indigo-200 text-indigo-800 rounded text-xs">XGBoost</span>
                    <span className="px-1 py-0.5 bg-indigo-200 text-indigo-800 rounded text-xs">SVM</span>
                  </div>
                </div>

                {/* ML Pipelines Card */}
                <div 
                  onClick={() => setActiveNavItem('pipelines')}
                  className="bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-300 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-105"
                >
                  <div className="flex items-center gap-1 mb-2">
                    <div className="p-1 bg-emerald-600 rounded">
                      <Settings className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-emerald-900">ML Pipelines</h3>
                  </div>
                  <p className="text-emerald-700 text-xs mb-2">
                    End-to-end ML workflows.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-1 py-0.5 bg-emerald-200 text-emerald-800 rounded text-xs">MLflow</span>
                    <span className="px-1 py-0.5 bg-emerald-200 text-emerald-800 rounded text-xs">Docker</span>
                  </div>
                </div>

                {/* RAG Systems Card */}
                <div 
                  onClick={() => setActiveNavItem('rag')}
                  className="bg-gradient-to-br from-teal-100 to-cyan-100 border border-teal-300 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-105"
                >
                  <div className="flex items-center gap-1 mb-2">
                    <div className="p-1 bg-teal-600 rounded">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-teal-900">RAG Systems</h3>
                  </div>
                  <p className="text-teal-700 text-xs mb-2">
                    Retrieval-Augmented Generation.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-1 py-0.5 bg-teal-200 text-teal-800 rounded text-xs">Vector DB</span>
                    <span className="px-1 py-0.5 bg-teal-200 text-teal-800 rounded text-xs">LLMs</span>
                  </div>
                </div>

                {/* AI Chatbot Card */}
                <div 
                  onClick={() => setActiveNavItem('chatbot')}
                  className="bg-gradient-to-br from-green-100 to-emerald-100 border border-green-300 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-105"
                >
                  <div className="flex items-center gap-1 mb-2">
                    <div className="p-1 bg-green-600 rounded">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-green-900">AI Chatbot</h3>
                  </div>
                  <p className="text-green-700 text-xs mb-2">
                    Build conversational AI systems.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-1 py-0.5 bg-green-200 text-green-800 rounded text-xs">NLP</span>
                    <span className="px-1 py-0.5 bg-green-200 text-green-800 rounded text-xs">Rasa</span>
                  </div>
                </div>

                {/* MLOps Card */}
                <div 
                  onClick={() => setActiveNavItem('mlops')}
                  className="bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-300 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-105"
                >
                  <div className="flex items-center gap-1 mb-2">
                    <div className="p-1 bg-purple-600 rounded">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-purple-900">MLOps</h3>
                  </div>
                  <p className="text-purple-700 text-xs mb-2">
                    ML lifecycle management.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-1 py-0.5 bg-purple-200 text-purple-800 rounded text-xs">CI/CD</span>
                    <span className="px-1 py-0.5 bg-purple-200 text-purple-800 rounded text-xs">MLflow</span>
                  </div>
                </div>

                {/* Resources Card */}
                <div 
                  onClick={() => setActiveNavItem('resources')}
                  className="bg-gradient-to-br from-gray-100 to-slate-100 border border-gray-300 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-105"
                >
                  <div className="flex items-center gap-1 mb-2">
                    <div className="p-1 bg-gray-600 rounded">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Resources</h3>
                  </div>
                  <p className="text-gray-700 text-xs mb-2">
                    Learning materials & docs.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-1 py-0.5 bg-gray-200 text-gray-800 rounded text-xs">Docs</span>
                    <span className="px-1 py-0.5 bg-gray-200 text-gray-800 rounded text-xs">Datasets</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features - Compact */}
            <div className="mb-3">
              <h2 className="text-md font-bold text-center text-gray-800 mb-2">
                ✨ Platform Features
              </h2>
              
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 bg-white/70 rounded-lg border border-blue-200">
                  <div className="p-1 bg-blue-100 rounded-full w-6 h-6 mx-auto mb-1 flex items-center justify-center">
                    <Play className="h-3 w-3 text-blue-600" />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-800 mb-0.5">Interactive</h3>
                  <p className="text-gray-600 text-xs">Real-time</p>
                </div>
                
                <div className="text-center p-2 bg-white/70 rounded-lg border border-green-200">
                  <div className="p-1 bg-green-100 rounded-full w-6 h-6 mx-auto mb-1 flex items-center justify-center">
                    <Code2 className="h-3 w-3 text-green-600" />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-800 mb-0.5">Production</h3>
                  <p className="text-gray-600 text-xs">Ready-to-use</p>
                </div>
                
                <div className="text-center p-2 bg-white/70 rounded-lg border border-purple-200">
                  <div className="p-1 bg-purple-100 rounded-full w-6 h-6 mx-auto mb-1 flex items-center justify-center">
                    <BarChart3 className="h-3 w-3 text-purple-600" />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-800 mb-0.5">Charts</h3>
                  <p className="text-gray-600 text-xs">Interactive</p>
                </div>
                
                <div className="text-center p-2 bg-white/70 rounded-lg border border-orange-200">
                  <div className="p-1 bg-orange-100 rounded-full w-6 h-6 mx-auto mb-1 flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-orange-600" />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-800 mb-0.5">Best Practices</h3>
                  <p className="text-gray-600 text-xs">Industry</p>
                </div>
              </div>
            </div>

            {/* Getting Started - Compact */}
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-lg p-3 text-center">
              <h2 className="text-md font-bold text-gray-800 mb-1">
                🎯 Ready to Start?
              </h2>
              <p className="text-xs text-gray-700 mb-2">
                Choose your learning path and start exploring AI/ML technologies.
              </p>
              
              <div className="flex flex-wrap gap-1 justify-center">
                <button 
                  onClick={() => setActiveNavItem('algorithms')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded text-xs font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  ML Algorithms
                </button>
                <button 
                  onClick={() => setActiveNavItem('chatbot')}
                  className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-3 py-1 rounded text-xs font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-200"
                >
                  AI Chatbots
                </button>
                <button 
                  onClick={() => setActiveNavItem('mlops')}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
                >
                  MLOps
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* ML Pipelines Section - Show when pipelines nav is active */}
        {activeNavItem === 'pipelines' && (
          <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-6">
          <>
            {/* ML Pipelines Collapsible Section */}
            <Collapsible open={mlPipelinesOpen} onOpenChange={(open: boolean) => setMlPipelinesOpen(open)}>
              <CollapsibleTrigger asChild>
                <div className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-2 border-emerald-300 rounded-xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-600 rounded-lg shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-emerald-900">
                          🔧 ML Pipelines
                        </h2>
                        <p className="text-sm text-emerald-600">End-to-End Machine Learning Workflows</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-emerald-700 font-medium">
                        {mlPipelinesOpen ? 'Hide Details' : 'Learn More'}
                      </span>
                      {mlPipelinesOpen ? (
                        <ChevronUp className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-emerald-600" />
                      )}
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 shadow-sm">
              <div className="space-y-6">
                {/* Pipeline Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    What are ML Pipelines?
                  </h3>
                  <p className="text-emerald-700 leading-relaxed mb-4">
                    {knowledgeLevel <= 2 ? (
                      "ML Pipelines are like assembly lines for machine learning! They automatically handle all the steps needed to turn raw data into predictions - from cleaning the data, to training the model, to making predictions. Think of it as a recipe that the computer follows every time."
                    ) : knowledgeLevel <= 4 ? (
                      "ML Pipelines are automated workflows that streamline the machine learning process from data preprocessing to model deployment. They ensure reproducibility, scalability, and maintainability of ML systems by chaining together data transformations, model training, and prediction steps."
                    ) : (
                      "ML Pipelines implement end-to-end MLOps workflows with automated data ingestion, feature engineering, model training, validation, deployment, and monitoring. They support CI/CD practices, A/B testing, model versioning, and automated retraining triggers for production ML systems."
                    )}
                  </p>
                </div>

                {/* Pipeline Components */}
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-.42-.94l1.329-2.05a2 2 0 00-.5-2.5L15.5 8.5a2 2 0 00-2.5-.5l-2.05 1.329a6 6 0 00-.94-.42l-.477-2.387a2 2 0 00-1.953-1.522H6.5a2 2 0 00-1.953 1.522l-.477 2.387a6 6 0 00-.94.42L1.08 7.5a2 2 0 00-2.5.5L-2.5 9.5a2 2 0 00-.5 2.5l1.329 2.05a6 6 0 00-.42.94l-2.387.477A2 2 0 00-5 17.5v1.077a2 2 0 001.522 1.953l2.387.477a6 6 0 00.42.94L.658 23.92a2 2 0 00.5 2.5L2.5 27.5a2 2 0 002.5.5l2.05-1.329a6 6 0 00.94.42l.477 2.387A2 2 0 0010.5 30h1.077a2 2 0 001.953-1.522l.477-2.387a6 6 0 00.94-.42l2.05 1.329a2 2 0 002.5-.5L20.5 25.5a2 2 0 00.5-2.5l-1.329-2.05a6 6 0 00.42-.94l2.387-.477A2 2 0 0023 17.5v-1.077a2 2 0 00-1.522-1.953z"/>
                    </svg>
                    Key Pipeline Components
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/70 p-4 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <h4 className="font-semibold text-emerald-800">Data Preprocessing</h4>
                      </div>
                      <p className="text-sm text-emerald-700">Clean, transform, and prepare raw data for model training</p>
                    </div>
                    
                    <div className="bg-white/70 p-4 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <h4 className="font-semibold text-emerald-800">Feature Engineering</h4>
                      </div>
                      <p className="text-sm text-emerald-700">Create and select the most relevant features for your model</p>
                    </div>
                    
                    <div className="bg-white/70 p-4 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <h4 className="font-semibold text-emerald-800">Model Training</h4>
                      </div>
                      <p className="text-sm text-emerald-700">Train and validate your machine learning models</p>
                    </div>
                    
                    <div className="bg-white/70 p-4 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <h4 className="font-semibold text-emerald-800">Model Deployment</h4>
                      </div>
                      <p className="text-sm text-emerald-700">Deploy models to production and monitor performance</p>
                    </div>
                  </div>
                </div>

                {/* Pipeline Benefits */}
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Why Use ML Pipelines?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm">Automation & Efficiency</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm">Reproducible Results</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm">Scalable Workflows</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm">Error Reduction</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm">Easy Collaboration</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm">Version Control</span>
                    </div>
                  </div>
                </div>

                {/* Popular Tools */}
                <div className="bg-white/60 rounded-lg border border-emerald-200 p-4">
                  <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Popular ML Pipeline Tools
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Apache Airflow</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Kubeflow</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">MLflow</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">TensorFlow Extended (TFX)</span>
                    <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium">Scikit-learn Pipeline</span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">AWS SageMaker</span>
                  </div>
                </div>

                {/* ML Production-Ready Pipelines Sub-section */}
                <div className="border-t border-violet-300 pt-6">
                  <Collapsible open={mlProductionPipelinesOpen} onOpenChange={(open: boolean) => setMlProductionPipelinesOpen(open)}>
                    <CollapsibleTrigger asChild>
                      <div className="cursor-pointer hover:bg-violet-50 p-3 rounded-lg transition-colors duration-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-violet-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                            </svg>
                            ML Production-Ready Pipelines
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-violet-700 font-medium">
                              {mlProductionPipelinesOpen ? 'Hide Code Examples' : 'Show Code Examples'}
                            </span>
                            {mlProductionPipelinesOpen ? (
                              <ChevronUp className="h-4 w-4 text-violet-600" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-violet-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-4">
                        <p className="text-violet-700 leading-relaxed">
                          {knowledgeLevel <= 2 ? (
                            "Production-ready pipelines are like professional assembly lines that can handle real-world data and serve millions of users. They include safety checks, monitoring, and automatic recovery when things go wrong."
                          ) : knowledgeLevel <= 4 ? (
                            "Production-ready ML pipelines incorporate robust error handling, monitoring, logging, automated testing, and deployment strategies to ensure reliable operation at scale in production environments."
                          ) : (
                            "Enterprise-grade ML pipelines implement comprehensive MLOps practices including CI/CD integration, automated testing, model versioning, A/B testing, canary deployments, monitoring, alerting, and automated rollback mechanisms for production reliability."
                          )}
                        </p>

                        {/* Collapsible Code Examples */}
                        <div className="space-y-4">
                          {/* Scikit-learn Pipeline Example */}
                          <Collapsible open={productionCodeOpen.sklearn} onOpenChange={(open: boolean) => setProductionCodeOpen({...productionCodeOpen, sklearn: open})}>
                            <CollapsibleTrigger asChild>
                              <Button variant="outline" className="w-full flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                                  </svg>
                                  <span>Scikit-learn Production Pipeline</span>
                                </div>
                                {productionCodeOpen.sklearn ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4">
                              <div className="bg-gray-900 rounded-lg p-4 border border-violet-300">
                                <div className="flex items-center gap-2 mb-3">
                                  <svg className="w-4 h-4 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                                  </svg>
                                  <h4 className="text-violet-400 font-semibold">Complete Production Pipeline</h4>
                                </div>
                                <pre className="text-green-300 text-xs overflow-x-auto leading-relaxed">
{`# Production-ready ML Pipeline with Scikit-learn
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
import joblib
import logging

# Setup logging for production monitoring
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProductionMLPipeline:
    def __init__(self):
        # Define preprocessing for numerical and categorical features
        self.numeric_features = ['age', 'income', 'credit_score']
        self.categorical_features = ['education', 'employment_type']
        
        # Create preprocessing pipelines
        numeric_transformer = StandardScaler()
        categorical_transformer = OneHotEncoder(drop='first', sparse=False)
        
        # Combine preprocessing steps
        self.preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, self.numeric_features),
                ('cat', categorical_transformer, self.categorical_features)
            ]
        )
        
        # Create the complete pipeline
        self.pipeline = Pipeline([
            ('preprocessor', self.preprocessor),
            ('classifier', RandomForestClassifier(
                n_estimators=100,
                random_state=42,
                n_jobs=-1  # Use all CPU cores
            ))
        ])
    
    def train(self, X_train, y_train):
        """Train the model with cross-validation"""
        try:
            logger.info("Starting model training...")
            
            # Perform cross-validation
            cv_scores = cross_val_score(self.pipeline, X_train, y_train, cv=5)
            logger.info(f"Cross-validation scores: {cv_scores}")
            logger.info(f"Mean CV score: {cv_scores.mean():.4f}")
            
            # Train on full dataset
            self.pipeline.fit(X_train, y_train)
            logger.info("Model training completed successfully")
            
            return cv_scores.mean()
            
        except Exception as e:
            logger.error(f"Training failed: {str(e)}")
            raise
    
    def predict(self, X):
        """Make predictions with error handling"""
        try:
            predictions = self.pipeline.predict(X)
            probabilities = self.pipeline.predict_proba(X)
            
            logger.info(f"Generated {len(predictions)} predictions")
            return predictions, probabilities
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise
    
    def save_model(self, filepath):
        """Save the trained pipeline"""
        try:
            joblib.dump(self.pipeline, filepath)
            logger.info(f"Model saved to {filepath}")
        except Exception as e:
            logger.error(f"Failed to save model: {str(e)}")
            raise
    
    def load_model(self, filepath):
        """Load a trained pipeline"""
        try:
            self.pipeline = joblib.load(filepath)
            logger.info(f"Model loaded from {filepath}")
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise

# Usage example
if __name__ == "__main__":
    # Initialize pipeline
    ml_pipeline = ProductionMLPipeline()
    
    # Train model (X_train, y_train would be your actual data)
    # cv_score = ml_pipeline.train(X_train, y_train)
    
    # Save trained model
    # ml_pipeline.save_model('production_model.pkl')
    
    # Make predictions
    # predictions, probabilities = ml_pipeline.predict(X_test)`}
                                </pre>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>

                          {/* MLflow Pipeline Example */}
                          <Collapsible open={productionCodeOpen.mlflow} onOpenChange={(open: boolean) => setProductionCodeOpen({...productionCodeOpen, mlflow: open})}>
                            <CollapsibleTrigger asChild>
                              <Button variant="outline" className="w-full flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                  </svg>
                                  <span>MLflow Experiment Tracking</span>
                                </div>
                                {productionCodeOpen.mlflow ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4">
                              <div className="bg-gray-900 rounded-lg p-4 border border-violet-300">
                                <div className="flex items-center gap-2 mb-3">
                                  <svg className="w-4 h-4 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                  </svg>
                                  <h4 className="text-violet-400 font-semibold">Model Tracking & Registry</h4>
                                </div>
                                <pre className="text-green-300 text-xs overflow-x-auto leading-relaxed">
{`# MLflow for experiment tracking and model registry
import mlflow
import mlflow.sklearn
from mlflow.tracking import MlflowClient
from sklearn.metrics import accuracy_score

class MLflowPipeline:
    def __init__(self, experiment_name="production_ml_pipeline"):
        # Set up MLflow experiment
        mlflow.set_experiment(experiment_name)
        self.client = MlflowClient()
    
    def train_and_track(self, X_train, y_train, X_test, y_test):
        """Train model with MLflow tracking"""
        
        with mlflow.start_run() as run:
            # Log parameters
            mlflow.log_param("model_type", "RandomForestClassifier")
            mlflow.log_param("n_estimators", 100)
            mlflow.log_param("random_state", 42)
            
            # Train model
            pipeline = ProductionMLPipeline()
            cv_score = pipeline.train(X_train, y_train)
            
            # Evaluate on test set
            predictions, probabilities = pipeline.predict(X_test)
            test_accuracy = accuracy_score(y_test, predictions)
            
            # Log metrics
            mlflow.log_metric("cv_score", cv_score)
            mlflow.log_metric("test_accuracy", test_accuracy)
            
            # Log model
            mlflow.sklearn.log_model(
                pipeline.pipeline,
                "model",
                registered_model_name="production_classifier"
            )
            
            # Log artifacts (plots, reports, etc.)
            # mlflow.log_artifact("confusion_matrix.png")
            
            print(f"Run ID: {run.info.run_id}")
            print(f"Model URI: runs:/{run.info.run_id}/model")
            
            return run.info.run_id
    
    def deploy_best_model(self, stage="Production"):
        """Deploy the best model to production"""
        
        # Get the best model from registry
        model_name = "production_classifier"
        latest_version = self.client.get_latest_versions(
            model_name, 
            stages=[stage]
        )[0]
        
        # Load model for serving
        model_uri = f"models:/{model_name}/{stage}"
        loaded_model = mlflow.sklearn.load_model(model_uri)
        
        print(f"Deployed model version: {latest_version.version}")
        return loaded_model

# Usage
pipeline = MLflowPipeline()
# run_id = pipeline.train_and_track(X_train, y_train, X_test, y_test)
# production_model = pipeline.deploy_best_model()`}
                                </pre>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>

                          {/* Docker Deployment Example */}
                          <Collapsible open={productionCodeOpen.docker} onOpenChange={(open: boolean) => setProductionCodeOpen({...productionCodeOpen, docker: open})}>
                            <CollapsibleTrigger asChild>
                              <Button variant="outline" className="w-full flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13.5 3H12H8C6.34 3 5 4.34 5 6V18C5 19.66 6.34 21 8 21H16C17.66 21 19 19.66 19 18V8L13.5 3ZM16 18H8V6H12V9H16V18Z"/>
                                  </svg>
                                  <span>Docker Production Deployment</span>
                                </div>
                                {productionCodeOpen.docker ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4">
                              <div className="bg-gray-900 rounded-lg p-4 border border-violet-300">
                                <div className="flex items-center gap-2 mb-3">
                                  <svg className="w-4 h-4 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13.5 3H12H8C6.34 3 5 4.34 5 6V18C5 19.66 6.34 21 8 21H16C17.66 21 19 19.66 19 18V8L13.5 3ZM16 18H8V6H12V9H16V18Z"/>
                                  </svg>
                                  <h4 className="text-violet-400 font-semibold">Containerized Deployment</h4>
                                </div>
                                <pre className="text-green-300 text-xs overflow-x-auto leading-relaxed">
{`# Dockerfile for ML Pipeline Deployment
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash mluser
RUN chown -R mluser:mluser /app
USER mluser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["python", "app.py"]

# docker-compose.yml for production deployment
version: '3.8'
services:
  ml-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=/app/models/production_model.pkl
      - LOG_LEVEL=INFO
    volumes:
      - ./models:/app/models:ro
      - ./logs:/app/logs
    restart: unless-stopped
    
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    
  monitoring:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped

# FastAPI Production Server (app.py)
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import logging

app = FastAPI(title="ML Production API")
logger = logging.getLogger(__name__)

# Load model at startup
model = None

@app.on_event("startup")
async def load_model():
    global model
    try:
        model = joblib.load("models/production_model.pkl")
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")

class PredictionRequest(BaseModel):
    features: list

@app.post("/predict")
async def predict(request: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        features = np.array(request.features).reshape(1, -1)
        prediction = model.predict(features)
        probability = model.predict_proba(features)
        
        return {
            "prediction": prediction.tolist(),
            "probability": probability.tolist()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}`}
                                </pre>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>

                        <div className="bg-white/70 p-4 rounded-lg border border-violet-200">
                      <h4 className="font-semibold text-violet-800 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Production Best Practices
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-violet-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Automated testing & validation</span>
                        </div>
                        <div className="flex items-center gap-2 text-violet-700">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Model versioning & registry</span>
                        </div>
                        <div className="flex items-center gap-2 text-violet-700">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Performance monitoring</span>
                        </div>
                        <div className="flex items-center gap-2 text-violet-700">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Data drift detection</span>
                        </div>
                        <div className="flex items-center gap-2 text-violet-700">
                          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                          <span>Automated rollback</span>
                        </div>
                        <div className="flex items-center gap-2 text-violet-700">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <span>Security & compliance</span>
                        </div>
                      </div>
                    </div>

                        {/* AWS ML Pipelines Section */}
                        <div className="border-t border-orange-300 pt-6 mt-6">
                          <Collapsible open={awsPipelinesOpen} onOpenChange={(open: boolean) => setAwsPipelinesOpen(open)}>
                            <CollapsibleTrigger asChild>
                              <div className="cursor-pointer hover:bg-orange-50 p-3 rounded-lg transition-colors duration-200">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-lg font-semibold text-orange-900 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.219-5.175 1.219-5.175s-.312-.623-.312-1.544c0-1.448.839-2.529 1.884-2.529.888 0 1.317.666 1.317 1.466 0 .893-.568 2.229-.861 3.467-.245 1.04.522 1.887 1.55 1.887 1.861 0 3.314-2.171 3.314-4.742 0-1.943-1.301-3.405-3.48-3.405-2.579 0-4.168 1.873-4.168 3.946 0 .719.257 1.233.677 1.627.186.219.212.307.145.558-.05.186-.162.658-.212.842-.065.238-.267.29-.412.211-1.148-.472-1.722-1.738-1.722-3.165 0-2.543 2.034-5.58 6.067-5.58 3.27 0 5.432 2.369 5.432 4.931 0 3.308-1.797 5.803-4.417 5.803-.883 0-1.714-.48-2.002-1.072 0 0-.478 1.925-.578 2.262-.173.665-.519 1.308-.926 1.827C9.845 23.69 10.892 24 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                                    </svg>
                                    Creating Production-Ready ML Pipelines on AWS
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-orange-700 font-medium">
                                      {awsPipelinesOpen ? 'Hide AWS Guide' : 'Show AWS Guide'}
                                    </span>
                                    {awsPipelinesOpen ? (
                                      <ChevronUp className="h-4 w-4 text-orange-600" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 text-orange-600" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent className="mt-4">
                              <div className="space-y-6">
                                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
                                  <p className="text-orange-700 leading-relaxed mb-4">
                                    {knowledgeLevel <= 2 ? (
                                      "AWS provides a complete set of tools to build machine learning pipelines that can handle real-world production workloads. Think of it like having a factory assembly line, but for training and deploying AI models automatically."
                                    ) : knowledgeLevel <= 4 ? (
                                      "AWS offers comprehensive services for building production-ready ML pipelines including Amazon SageMaker, AWS Step Functions, and CloudFormation for infrastructure automation. This approach ensures scalability, reliability, and maintainability of ML workflows."
                                    ) : (
                                      "AWS provides enterprise-grade MLOps capabilities through SageMaker Pipelines, Step Functions orchestration, CloudFormation infrastructure-as-code, and integrated monitoring/logging services for production ML lifecycle management."
                                    )}
                                  </p>
                                  
                                  <div className="bg-white/70 p-3 rounded border border-orange-300">
                                    <p className="text-sm text-orange-800 font-medium flex items-center gap-2">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                      </svg>
                                      <strong>Source:</strong> 
                                      <a href="https://docs.aws.amazon.com/prescriptive-guidance/latest/ml-production-ready-pipelines/welcome.html" 
                                         target="_blank" 
                                         rel="noopener noreferrer"
                                         className="text-blue-600 hover:text-blue-800 underline">
                                        AWS Prescriptive Guidance - Creating production-ready ML pipelines on AWS
                                      </a>
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    6-Step Process for AWS ML Pipelines
                                  </h4>
                                  
                                  <div className="space-y-4">
                                    {/* Step 1 */}
                                    <div className="bg-white/70 p-4 rounded-lg border border-emerald-200">
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                          1
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="font-semibold text-emerald-800 mb-2">Perform EDA and Develop Initial Model</h5>
                                          <p className="text-sm text-emerald-700 mb-3">
                                            Data scientists make raw data available in Amazon S3, perform exploratory data analysis (EDA), develop the initial ML model, and evaluate its inference performance. You can conduct these activities interactively through Jupyter notebooks.
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Amazon S3</span>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Jupyter Notebooks</span>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">EDA</span>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Model Development</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="bg-white/70 p-4 rounded-lg border border-emerald-200">
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                          2
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="font-semibold text-emerald-800 mb-2">Create Runtime Scripts</h5>
                                          <p className="text-sm text-emerald-700 mb-3">
                                            You integrate the model with runtime Python scripts so that it can be managed and provisioned by Amazon SageMaker AI. This is the first step in moving away from interactive development toward production. Define logic for preprocessing, evaluation, training, and inference separately.
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Python Scripts</span>
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Amazon SageMaker</span>
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Preprocessing</span>
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Training Logic</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="bg-white/70 p-4 rounded-lg border border-emerald-200">
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                          3
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="font-semibold text-emerald-800 mb-2">Define the Pipeline</h5>
                                          <p className="text-sm text-emerald-700 mb-3">
                                            You define the input and output placeholders for each step of the pipeline. Concrete values for these will be supplied later, during runtime (step 5). Focus on pipelines for training, inference, cross-validation, and back-testing.
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Pipeline Definition</span>
                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Input/Output Placeholders</span>
                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Cross-validation</span>
                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Back-testing</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="bg-white/70 p-4 rounded-lg border border-emerald-200">
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                          4
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="font-semibold text-emerald-800 mb-2">Create the Pipeline</h5>
                                          <p className="text-sm text-emerald-700 mb-3">
                                            You create the underlying infrastructure, including the AWS Step Functions state machine instance in an automated (nearly one-click) fashion, by using AWS CloudFormation.
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">AWS Step Functions</span>
                                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">CloudFormation</span>
                                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Infrastructure as Code</span>
                                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Automation</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Step 5 */}
                                    <div className="bg-white/70 p-4 rounded-lg border border-emerald-200">
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                          5
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="font-semibold text-emerald-800 mb-2">Run the Pipeline</h5>
                                          <p className="text-sm text-emerald-700 mb-3">
                                            You run the pipeline defined in step 4. Prepare metadata and data or data locations to fill in concrete values for the input/output placeholders defined in step 3. This includes the runtime scripts from step 2 as well as model hyperparameters.
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">Pipeline Execution</span>
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">Metadata</span>
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">Hyperparameters</span>
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">Runtime Scripts</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Step 6 */}
                                    <div className="bg-white/70 p-4 rounded-lg border border-emerald-200">
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                          6
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="font-semibold text-emerald-800 mb-2">Expand the Pipeline</h5>
                                          <p className="text-sm text-emerald-700 mb-3">
                                            You implement continuous integration and continuous deployment (CI/CD) processes, automated retraining, scheduled inference, and similar extensions of the pipeline.
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">CI/CD</span>
                                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Automated Retraining</span>
                                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Scheduled Inference</span>
                                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Pipeline Extensions</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* AWS Services Overview */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.219-5.175 1.219-5.175s-.312-.623-.312-1.544c0-1.448.839-2.529 1.884-2.529.888 0 1.317.666 1.317 1.466 0 .893-.568 2.229-.861 3.467-.245 1.04.522 1.887 1.55 1.887 1.861 0 3.314-2.171 3.314-4.742 0-1.943-1.301-3.405-3.48-3.405-2.579 0-4.168 1.873-4.168 3.946 0 .719.257 1.233.677 1.627.186.219.212.307.145.558-.05.186-.162.658-.212.842-.065.238-.267.29-.412.211-1.148-.472-1.722-1.738-1.722-3.165 0-2.543 2.034-5.58 6.067-5.58 3.27 0 5.432 2.369 5.432 4.931 0 3.308-1.797 5.803-4.417 5.803-.883 0-1.714-.48-2.002-1.072 0 0-.478 1.925-.578 2.262-.173.665-.519 1.308-.926 1.827C9.845 23.69 10.892 24 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                                    </svg>
                                    Key AWS Services for ML Pipelines
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <div className="bg-white/70 p-3 rounded border border-blue-300">
                                      <h5 className="font-semibold text-blue-800 text-sm mb-1">Amazon SageMaker</h5>
                                      <p className="text-xs text-blue-700">End-to-end ML platform for model development, training, and deployment</p>
                                    </div>
                                    <div className="bg-white/70 p-3 rounded border border-blue-300">
                                      <h5 className="font-semibold text-blue-800 text-sm mb-1">AWS Step Functions</h5>
                                      <p className="text-xs text-blue-700">Orchestrate ML workflows with visual state machines</p>
                                    </div>
                                    <div className="bg-white/70 p-3 rounded border border-blue-300">
                                      <h5 className="font-semibold text-blue-800 text-sm mb-1">AWS CloudFormation</h5>
                                      <p className="text-xs text-blue-700">Infrastructure as code for automated resource provisioning</p>
                                    </div>
                                    <div className="bg-white/70 p-3 rounded border border-blue-300">
                                      <h5 className="font-semibold text-blue-800 text-sm mb-1">Amazon S3</h5>
                                      <p className="text-xs text-blue-700">Scalable data storage for training datasets and model artifacts</p>
                                    </div>
                                    <div className="bg-white/70 p-3 rounded border border-blue-300">
                                      <h5 className="font-semibold text-blue-800 text-sm mb-1">AWS Lambda</h5>
                                      <p className="text-xs text-blue-700">Serverless compute for lightweight ML processing tasks</p>
                                    </div>
                                    <div className="bg-white/70 p-3 rounded border border-blue-300">
                                      <h5 className="font-semibold text-blue-800 text-sm mb-1">Amazon CloudWatch</h5>
                                      <p className="text-xs text-blue-700">Monitoring and logging for ML pipeline observability</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        </>
        </div>
        )}

        {/* RAG Section - Show when rag nav is active */}
        {activeNavItem === 'rag' && (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 rounded-2xl p-6">
        <Collapsible open={ragOpen} onOpenChange={(open: boolean) => setRagOpen(open)}>
          <CollapsibleTrigger asChild>
            <div className="bg-gradient-to-r from-teal-100 via-cyan-100 to-blue-100 border-2 border-teal-300 rounded-xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-600 rounded-lg shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-teal-900">
                      🔍 What is Retrieval-Augmented Generation (RAG)?
                    </h2>
                    <p className="text-sm text-teal-600">Understanding RAG architecture, components, and implementation steps</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-teal-700 font-medium">
                    {ragOpen ? 'Hide RAG Guide' : 'Show RAG Guide'}
                  </span>
                  {ragOpen ? (
                    <ChevronUp className="h-5 w-5 text-teal-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-teal-600" />
                  )}
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mb-6">
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-6 shadow-sm">
              <div className="space-y-6">
                {/* RAG Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-teal-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    What is RAG?
                  </h3>
                  <p className="text-teal-700 leading-relaxed mb-4">
                    {knowledgeLevel <= 2 ? (
                      "Retrieval-Augmented Generation (RAG) is like giving an AI assistant access to a huge library! Instead of only using what it learned during training, RAG allows the AI to look up current, specific information from external sources (like documents, databases, or websites) and then use that fresh information to give you better, more accurate answers."
                    ) : knowledgeLevel <= 4 ? (
                      "RAG is an AI framework that enhances large language models by combining their generative capabilities with external knowledge retrieval. It retrieves relevant information from external sources and incorporates it into the generation process, enabling more accurate, up-to-date, and contextually relevant responses."
                    ) : (
                      "RAG is an advanced NLP architecture that augments pre-trained language models with dynamic knowledge retrieval mechanisms. It employs dense vector representations, semantic search, and contextual integration to ground generated content in external knowledge bases, addressing limitations of parametric knowledge and enabling real-time information access."
                    )}
                  </p>
                </div>

                {/* RAG Architecture */}
                <div>
                  <h3 className="text-lg font-semibold text-teal-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-.42-.94l1.329-2.05a2 2 0 00-.5-2.5L15.5 8.5a2 2 0 00-2.5-.5l-2.05 1.329a6 6 0 00-.94-.42l-.477-2.387a2 2 0 00-1.953-1.522H6.5a2 2 0 00-1.953 1.522l-.477 2.387a6 6 0 00-.94.42L1.08 7.5a2 2 0 00-2.5.5L-2.5 9.5a2 2 0 00-.5 2.5l1.329 2.05a6 6 0 00-.42.94l-2.387.477A2 2 0 00-5 17.5v1.077a2 2 0 001.522 1.953l2.387.477a6 6 0 00.42.94L.658 23.92a2 2 0 00.5 2.5L2.5 27.5a2 2 0 002.5.5l2.05-1.329a6 6 0 00.94.42l.477 2.387A2 2 0 0010.5 30h1.077a2 2 0 001.953-1.522l.477-2.387a6 6 0 00.94-.42l2.05 1.329a2 2 0 002.5-.5L20.5 25.5a2 2 0 00.5-2.5l-1.329-2.05a6 6 0 00.42-.94l2.387-.477A2 2 0 0023 17.5v-1.077a2 2 0 00-1.522-1.953z"/>
                    </svg>
                    RAG Architecture Components
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/70 p-4 rounded-lg border border-teal-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <h4 className="font-semibold text-teal-800">Knowledge Base</h4>
                      </div>
                      <p className="text-sm text-teal-700">External documents, databases, or APIs that contain the information to be retrieved</p>
                    </div>
                    
                    <div className="bg-white/70 p-4 rounded-lg border border-teal-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <h4 className="font-semibold text-teal-800">Retrieval System</h4>
                      </div>
                      <p className="text-sm text-teal-700">Vector databases and semantic search engines that find relevant information</p>
                    </div>
                    
                    <div className="bg-white/70 p-4 rounded-lg border border-teal-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <h4 className="font-semibold text-teal-800">Generation Model</h4>
                      </div>
                      <p className="text-sm text-teal-700">Large Language Model that generates responses using retrieved context</p>
                    </div>
                  </div>
                </div>

                {/* RAG Steps */}
                <div>
                  <h3 className="text-lg font-semibold text-teal-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    RAG Implementation Steps
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="bg-white/70 p-4 rounded-lg border border-teal-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          1
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-teal-800 mb-2">Document Ingestion & Preprocessing</h5>
                          <p className="text-sm text-teal-700 mb-3">
                            Collect and prepare your knowledge base by ingesting documents, cleaning text, and splitting content into manageable chunks for efficient retrieval.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs">Document Loading</span>
                            <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs">Text Cleaning</span>
                            <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs">Chunking</span>
                            <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs">Metadata Extraction</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white/70 p-4 rounded-lg border border-teal-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          2
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-teal-800 mb-2">Embedding Generation</h5>
                          <p className="text-sm text-teal-700 mb-3">
                            Convert text chunks into dense vector representations using embedding models. These vectors capture semantic meaning for similarity search.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded text-xs">Text Embeddings</span>
                            <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded text-xs">Vector Representations</span>
                            <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded text-xs">Semantic Encoding</span>
                            <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded text-xs">Dimensionality</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white/70 p-4 rounded-lg border border-teal-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          3
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-teal-800 mb-2">Vector Database Storage</h5>
                          <p className="text-sm text-teal-700 mb-3">
                            Store embeddings in a vector database optimized for fast similarity search and retrieval operations at scale.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Vector DB</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Indexing</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Similarity Search</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Scalability</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="bg-white/70 p-4 rounded-lg border border-teal-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          4
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-teal-800 mb-2">Query Processing & Retrieval</h5>
                          <p className="text-sm text-teal-700 mb-3">
                            Process user queries by converting them to embeddings and retrieving the most relevant documents from the vector database.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Query Embedding</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Similarity Matching</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Ranking</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Top-K Retrieval</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="bg-white/70 p-4 rounded-lg border border-teal-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          5
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-teal-800 mb-2">Context Integration</h5>
                          <p className="text-sm text-teal-700 mb-3">
                            Combine retrieved documents with the user query to create enriched context for the language model.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Context Assembly</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Prompt Engineering</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Information Fusion</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Relevance Filtering</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 6 */}
                    <div className="bg-white/70 p-4 rounded-lg border border-teal-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          6
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-teal-800 mb-2">Response Generation</h5>
                          <p className="text-sm text-teal-700 mb-3">
                            Use the language model to generate accurate, contextually relevant responses based on the retrieved information and user query.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">LLM Generation</span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Context-Aware</span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Factual Grounding</span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Response Quality</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RAG Benefits */}
                <div>
                  <h3 className="text-lg font-semibold text-teal-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Why Use RAG?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 text-teal-700">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm">Up-to-date Information</span>
                    </div>
                    <div className="flex items-center gap-2 text-teal-700">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm">Reduced Hallucinations</span>
                    </div>
                    <div className="flex items-center gap-2 text-teal-700">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm">Domain-Specific Knowledge</span>
                    </div>
                    <div className="flex items-center gap-2 text-teal-700">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm">Transparent Sources</span>
                    </div>
                  </div>
                </div>

                {/* Popular RAG Tools */}
                <div className="bg-white/60 rounded-lg border border-teal-200 p-4">
                  <h4 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Popular RAG Tools & Frameworks
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">LangChain</span>
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-medium">LlamaIndex</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Pinecone</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Weaviate</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Chroma</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">FAISS</span>
                    <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium">Qdrant</span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">Milvus</span>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        </div>
        )}

        {/* ML Algorithms Section - Show when algorithms nav is active */}
        {activeNavItem === 'algorithms' && (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-2xl p-6">
        <>
        {/* Algorithm Selection Guide */}
        <div className="bg-gradient-to-r from-indigo-100 via-blue-100 to-purple-100 border-2 border-indigo-300 rounded-xl p-6 shadow-lg mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-bold text-indigo-900 mb-2">
                🚀 Explore Machine Learning Algorithms
              </h2>
              <p className="text-indigo-700 mb-4 leading-relaxed text-sm md:text-base">
                Discover the power of machine learning through interactive algorithm exploration. Each algorithm comes with real-time parameter tuning, 
                performance visualization, and production-ready code examples.
              </p>
              
              {/* Usage Instructions - Compact */}
              <div className="bg-white/70 rounded-lg border border-indigo-200 p-3 mb-4">
                <p className="text-indigo-800 text-xs leading-tight">
                  💡 How to use: Set your knowledge level → Click any algorithm tab → Adjust parameters → Click "Run Model" → Explore results and charts
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-indigo-700">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Real-time parameter tuning</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-700">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Interactive visualizations</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-700">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Performance metrics</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-700">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Production-ready code</span>
                </div>
              </div>
            </div>

            {/* Hidden ML Knowledge Level Slider for future use */}
            {/* 
            <div className="flex flex-col items-center gap-4 lg:w-32">
              <div className="text-center">
                <h3 className="text-sm font-semibold text-indigo-900 mb-2">ML Knowledge Level</h3>
                <div className="space-y-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium text-center ${levelInfo.bgColor} ${levelInfo.color}`}>
                    Level {knowledgeLevel}: {levelInfo.label}
                  </div>
                  
                  <div className="flex flex-col items-center h-32 py-2">
                    <div className="flex-1 flex items-center">
                      <div className="flex-1 min-w-0">
                        <Slider
                          value={[knowledgeLevel]}
                          onValueChange={(value: number[]) => setKnowledgeLevel(value[0])}
                          orientation="vertical"
                          min={1}
                          max={5}
                          step={1}
                          className="h-24"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-indigo-600 mt-2 text-center">
                      <div>1: Beginner</div>
                      <div>5: Expert</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            */}
          </div>
        </div>

        {/* Machine Learning Types Sections */}
        
        {/* Supervised Learning Section */}
        <Collapsible open={supervisedLearningOpen} onOpenChange={(open: boolean) => setSupervisedLearningOpen(open)}>
          <CollapsibleTrigger asChild>
            <div className="bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 border-2 border-green-300 rounded-xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600 rounded-lg shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-green-900">
                      📊 Supervised Learning
                    </h2>
                    <p className="text-sm text-green-600">Trains models on labeled data to predict or classify new, unseen data</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-700 font-medium">
                    {supervisedLearningOpen ? 'Hide Details' : 'Show Details'}
                  </span>
                  {supervisedLearningOpen ? (
                    <ChevronUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
              <div className="space-y-6">
                {/* Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    What is Supervised Learning?
                  </h3>
                  <p className="text-green-700 leading-relaxed mb-4">
                    Supervised learning uses labeled training data to learn a mapping function from input variables (X) to output variables (Y). 
                    The algorithm learns from examples where both the input and the correct output are provided, enabling it to make predictions on new, unseen data.
                  </p>
                </div>

                {/* Types of Supervised Learning */}
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-.42-.94l1.329-2.05a2 2 0 00-.5-2.5L15.5 8.5a2 2 0 00-2.5-.5l-2.05 1.329a6 6 0 00-.94-.42l-.477-2.387a2 2 0 00-1.953-1.522H6.5a2 2 0 00-1.953 1.522l-.477 2.387a6 6 0 00-.94.42L1.08 7.5a2 2 0 00-2.5.5L-2.5 9.5a2 2 0 00-.5 2.5l1.329 2.05a6 6 0 00-.42.94l-2.387.477A2 2 0 00-5 17.5v1.077a2 2 0 001.522 1.953l2.387.477a6 6 0 00.42.94L.658 23.92a2 2 0 00.5 2.5L2.5 27.5a2 2 0 002.5.5l2.05-1.329a6 6 0 00.94.42l.477 2.387A2 2 0 0010.5 30h1.077a2 2 0 001.953-1.522l.477-2.387a6 6 0 00.94-.42l2.05 1.329a2 2 0 002.5-.5L20.5 25.5a2 2 0 00.5-2.5l-1.329-2.05a6 6 0 00.42-.94l2.387-.477A2 2 0 0023 17.5v-1.077a2 2 0 00-1.522-1.953z"/>
                    </svg>
                    Types of Supervised Learning
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <h4 className="font-semibold text-green-800">Classification</h4>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        Predicts discrete labels or categories. Examples: Email spam detection, image recognition, medical diagnosis.
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Binary Classification</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Multi-class</span>
                      </div>
                    </div>
                    
                    <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <h4 className="font-semibold text-green-800">Regression</h4>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        Predicts continuous numerical values. Examples: House price prediction, stock market forecasting, temperature prediction.
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Linear Regression</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Polynomial</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Most Commonly Used Algorithms */}
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Most Commonly Used Algorithms
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="bg-white/70 p-3 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 text-sm mb-1">1. Linear Regression</h5>
                      <p className="text-xs text-green-700">Simple yet powerful for continuous value prediction</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 text-sm mb-1">2. Logistic Regression</h5>
                      <p className="text-xs text-green-700">Binary and multi-class classification</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 text-sm mb-1">3. Decision Trees</h5>
                      <p className="text-xs text-green-700">Interpretable tree-based decisions</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 text-sm mb-1">4. Support Vector Machines</h5>
                      <p className="text-xs text-green-700">Effective for high-dimensional data</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 text-sm mb-1">5. k-Nearest Neighbors</h5>
                      <p className="text-xs text-green-700">Instance-based learning algorithm</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 text-sm mb-1">6. Naïve Bayes</h5>
                      <p className="text-xs text-green-700">Probabilistic classifier based on Bayes' theorem</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 text-sm mb-1">7. Random Forest</h5>
                      <p className="text-xs text-green-700">Ensemble method using multiple decision trees</p>
                    </div>
                  </div>
                </div>

                {/* Ensemble Learning */}
                <div className="bg-white/60 rounded-lg border border-green-200 p-4">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Introduction to Ensemble Learning
                  </h4>
                  <p className="text-sm text-green-700 mb-3">
                    Ensemble learning combines multiple models to create a stronger predictor than any individual model. 
                    Random Forest is a popular bagging algorithm that uses multiple decision trees.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Bagging</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Boosting</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Stacking</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Voting</span>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Unsupervised Learning Section */}
        <Collapsible open={unsupervisedLearningOpen} onOpenChange={(open: boolean) => setUnsupervisedLearningOpen(open)}>
          <CollapsibleTrigger asChild>
            <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 border-2 border-orange-300 rounded-xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-600 rounded-lg shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-orange-900">
                      🔍 Unsupervised Learning
                    </h2>
                    <p className="text-sm text-orange-600">Finds patterns or groups in unlabeled data, like clustering or dimensionality reduction</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-orange-700 font-medium">
                    {unsupervisedLearningOpen ? 'Hide Details' : 'Show Details'}
                  </span>
                  {unsupervisedLearningOpen ? (
                    <ChevronUp className="h-5 w-5 text-orange-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-orange-600" />
                  )}
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mb-6">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 shadow-sm">
              <div className="space-y-6">
                {/* Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    What is Unsupervised Learning?
                  </h3>
                  <p className="text-orange-700 leading-relaxed mb-4">
                    Unsupervised learning works with unlabeled data to discover hidden patterns, structures, or relationships. 
                    Unlike supervised learning, there are no target variables or correct answers provided during training. 
                    The algorithm must find patterns on its own.
                  </p>
                </div>

                {/* Types of Unsupervised Learning */}
                <div>
                  <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-.42-.94l1.329-2.05a2 2 0 00-.5-2.5L15.5 8.5a2 2 0 00-2.5-.5l-2.05 1.329a6 6 0 00-.94-.42l-.477-2.387a2 2 0 00-1.953-1.522H6.5a2 2 0 00-1.953 1.522l-.477 2.387a6 6 0 00-.94.42L1.08 7.5a2 2 0 00-2.5.5L-2.5 9.5a2 2 0 00-.5 2.5l1.329 2.05a6 6 0 00-.42.94l-2.387.477A2 2 0 00-5 17.5v1.077a2 2 0 001.522 1.953l2.387.477a6 6 0 00.42.94L.658 23.92a2 2 0 00.5 2.5L2.5 27.5a2 2 0 002.5.5l2.05-1.329a6 6 0 00.94.42l.477 2.387A2 2 0 0010.5 30h1.077a2 2 0 001.953-1.522l.477-2.387a6 6 0 00.94-.42l2.05 1.329a2 2 0 002.5-.5L20.5 25.5a2 2 0 00.5-2.5l-1.329-2.05a6 6 0 00.42-.94l2.387-.477A2 2 0 0023 17.5v-1.077a2 2 0 00-1.522-1.953z"/>
                    </svg>
                    Types of Unsupervised Learning
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/70 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <h4 className="font-semibold text-orange-800">Clustering</h4>
                      </div>
                      <p className="text-sm text-orange-700 mb-3">
                        Groups similar data points together. Examples: Customer segmentation, gene sequencing, market research.
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">K-Means</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Hierarchical</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">DBSCAN</span>
                      </div>
                    </div>
                    
                    <div className="bg-white/70 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <h4 className="font-semibold text-orange-800">Association Rule Mining</h4>
                      </div>
                      <p className="text-sm text-orange-700 mb-3">
                        Finds relationships between different items. Examples: Market basket analysis, recommendation systems.
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Apriori</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">FP-Growth</span>
                      </div>
                    </div>

                    <div className="bg-white/70 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <h4 className="font-semibold text-orange-800">Dimensionality Reduction</h4>
                      </div>
                      <p className="text-sm text-orange-700 mb-3">
                        Reduces the number of features while preserving important information. Examples: Data visualization, noise reduction.
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">PCA</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">t-SNE</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">UMAP</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Common Applications */}
                <div className="bg-white/60 rounded-lg border border-orange-200 p-4">
                  <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Common Applications
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-orange-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Customer segmentation</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Anomaly detection</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Recommendation systems</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Data compression</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-700">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <span>Feature extraction</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-700">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span>Data visualization</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Reinforcement Learning Section */}
        <Collapsible open={reinforcementLearningOpen} onOpenChange={(open: boolean) => setReinforcementLearningOpen(open)}>
          <CollapsibleTrigger asChild>
            <div className="bg-gradient-to-r from-red-100 via-pink-100 to-rose-100 border-2 border-red-300 rounded-xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-600 rounded-lg shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-red-900">
                      🎯 Reinforcement Learning
                    </h2>
                    <p className="text-sm text-red-600">Learns through trial and error to maximize rewards, ideal for decision-making tasks</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-700 font-medium">
                    {reinforcementLearningOpen ? 'Hide Details' : 'Show Details'}
                  </span>
                  {reinforcementLearningOpen ? (
                    <ChevronUp className="h-5 w-5 text-red-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mb-6">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-sm">
              <div className="space-y-6">
                {/* Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    What is Reinforcement Learning?
                  </h3>
                  <p className="text-red-700 leading-relaxed mb-4">
                    Reinforcement Learning (RL) is a type of machine learning where an agent learns to make decisions by interacting with an environment. 
                    The agent receives rewards or penalties for its actions and learns to maximize cumulative rewards over time through trial and error.
                  </p>
                </div>

                {/* Key Components */}
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-.42-.94l1.329-2.05a2 2 0 00-.5-2.5L15.5 8.5a2 2 0 00-2.5-.5l-2.05 1.329a6 6 0 00-.94-.42l-.477-2.387a2 2 0 00-1.953-1.522H6.5a2 2 0 00-1.953 1.522l-.477 2.387a6 6 0 00-.94.42L1.08 7.5a2 2 0 00-2.5.5L-2.5 9.5a2 2 0 00-.5 2.5l1.329 2.05a6 6 0 00-.42.94l-2.387.477A2 2 0 00-5 17.5v1.077a2 2 0 001.522 1.953l2.387.477a6 6 0 00.42.94L.658 23.92a2 2 0 00.5 2.5L2.5 27.5a2 2 0 002.5.5l2.05-1.329a6 6 0 00.94.42l.477 2.387A2 2 0 0010.5 30h1.077a2 2 0 001.953-1.522l.477-2.387a6 6 0 00.94-.42l2.05 1.329a2 2 0 002.5-.5L20.5 25.5a2 2 0 00.5-2.5l-1.329-2.05a6 6 0 00.42-.94l2.387-.477A2 2 0 0023 17.5v-1.077a2 2 0 00-1.522-1.953z"/>
                    </svg>
                    Key Components of RL
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/70 p-4 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <h4 className="font-semibold text-red-800">Agent</h4>
                      </div>
                      <p className="text-sm text-red-700">The learner or decision maker that takes actions in the environment</p>
                    </div>
                    
                    <div className="bg-white/70 p-4 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <h4 className="font-semibold text-red-800">Environment</h4>
                      </div>
                      <p className="text-sm text-red-700">The world in which the agent operates and receives feedback</p>
                    </div>

                    <div className="bg-white/70 p-4 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <h4 className="font-semibold text-red-800">Actions</h4>
                      </div>
                      <p className="text-sm text-red-700">The set of possible moves the agent can make</p>
                    </div>

                    <div className="bg-white/70 p-4 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <h4 className="font-semibold text-red-800">Rewards</h4>
                      </div>
                      <p className="text-sm text-red-700">Feedback signals that guide the agent's learning process</p>
                    </div>
                  </div>
                </div>

                {/* Applications */}
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Real-World Applications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="bg-white/70 p-3 rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-800 text-sm mb-1">Game Playing</h5>
                      <p className="text-xs text-red-700">Chess, Go, video games (AlphaGo, OpenAI Five)</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-800 text-sm mb-1">Autonomous Vehicles</h5>
                      <p className="text-xs text-red-700">Self-driving cars, navigation systems</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-800 text-sm mb-1">Robotics</h5>
                      <p className="text-xs text-red-700">Robot control, manipulation tasks</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-800 text-sm mb-1">Finance</h5>
                      <p className="text-xs text-red-700">Algorithmic trading, portfolio management</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-800 text-sm mb-1">Healthcare</h5>
                      <p className="text-xs text-red-700">Treatment optimization, drug discovery</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-800 text-sm mb-1">Recommendation Systems</h5>
                      <p className="text-xs text-red-700">Personalized content, adaptive interfaces</p>
                    </div>
                  </div>
                </div>

                {/* Popular Algorithms */}
                <div className="bg-white/60 rounded-lg border border-red-200 p-4">
                  <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Popular RL Algorithms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Q-Learning</span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Deep Q-Network (DQN)</span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Policy Gradient</span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Actor-Critic</span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">PPO</span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">SARSA</span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">A3C</span>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Popular Machine Learning Algorithms Section */}
        <Collapsible open={mlAlgorithmsOpen} onOpenChange={(open: boolean) => setMlAlgorithmsOpen(open)}>
          <CollapsibleTrigger asChild>
            <div className="bg-gradient-to-r from-indigo-100 via-blue-100 to-purple-100 border-2 border-indigo-300 rounded-xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-indigo-900">
                      🤖 Popular Machine Learning Algorithms
                    </h2>
                    <p className="text-sm text-indigo-600">Interactive exploration of 5 powerful ML algorithms with real-time parameter tuning</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-indigo-700 font-medium">
                    {mlAlgorithmsOpen ? 'Hide Algorithms' : 'Show Algorithms'}
                  </span>
                  {mlAlgorithmsOpen ? (
                    <ChevronUp className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-indigo-600" />
                  )}
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
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
          </CollapsibleContent>
        </Collapsible>
        </>
        </div>
        )}

        {/* AI Chatbot Section - Show when chatbot nav is active */}
        {activeNavItem === 'chatbot' && (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6">
        <Collapsible open={chatbotOpen} onOpenChange={(open: boolean) => setChatbotOpen(open)}>
          <CollapsibleTrigger asChild>
            <div className="bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 border-2 border-green-300 rounded-xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600 rounded-lg shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-green-900">
                      🤖 AI Chatbot Development
                    </h2>
                    <p className="text-sm text-green-600">Building Intelligent Conversational AI Systems</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-700 font-medium">
                    {chatbotOpen ? 'Hide Chatbot Guide' : 'Show Chatbot Guide'}
                  </span>
                  {chatbotOpen ? (
                    <ChevronUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
              <div className="space-y-6">
                {/* Chatbot Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    What is an AI Chatbot?
                  </h3>
                  <p className="text-green-700 leading-relaxed mb-4">
                    {knowledgeLevel <= 2 ? (
                      "An AI Chatbot is like a smart computer assistant that can have conversations with people! It uses artificial intelligence to understand what you're saying and respond in a helpful way. Think of it like having a knowledgeable friend who's available 24/7 to answer questions, help with tasks, or just chat."
                    ) : knowledgeLevel <= 4 ? (
                      "AI Chatbots are conversational interfaces powered by natural language processing (NLP) and machine learning. They can understand user intent, maintain context across conversations, and provide intelligent responses. Modern chatbots use transformer models, intent recognition, and dialogue management systems."
                    ) : (
                      "AI Chatbots are sophisticated conversational AI systems that leverage large language models (LLMs), retrieval-augmented generation (RAG), intent classification, entity extraction, dialogue state tracking, and multi-turn conversation management to deliver contextually aware, personalized user experiences."
                    )}
                  </p>
                </div>

                {/* Popular Tools */}
                <div className="bg-white/60 rounded-lg border border-green-200 p-4">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Popular Chatbot Frameworks & Tools
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Rasa</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Dialogflow</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Microsoft Bot Framework</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Hugging Face Transformers</span>
                    <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium">ChatterBot</span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">OpenAI GPT API</span>
                    <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">Amazon Lex</span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">IBM Watson Assistant</span>
                  </div>
                </div>

                {/* Document Upload and Chat Feature */}
                <div className="border-t border-green-300 pt-6">
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-xl p-6 shadow-sm">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-green-900 mb-2 flex items-center justify-center gap-2">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                        </svg>
                        💬 Chat with Your Documents
                      </h3>
                      <p className="text-green-700 text-sm mb-4">
                        Upload your documents and have intelligent conversations with an AI chatbot. 
                        Supports PDF, TXT, DOC, and DOCX files up to 0.5MB.
                      </p>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
                        <strong>Demo Feature:</strong> This is a frontend-only simulation using basic keyword matching. 
                        For a full production implementation with LangChain and open-source LLMs, 
                        <a href="https://www.linkedin.com/in/ahmadziyad/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 underline ml-1">
                          contact me for a complete demo
                        </a>.
                      </div>
                    </div>

                    {!uploadedDocument ? (
                      /* Document Upload Area */
                      <div 
                        className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors duration-200 bg-white/50"
                        onDragOver={handleDocumentDragOver}
                        onDrop={handleDocumentDrop}
                      >
                        <div className="space-y-4">
                          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          
                          <div>
                            <h4 className="text-lg font-semibold text-green-900 mb-2">Upload Your Document</h4>
                            <p className="text-green-700 text-sm mb-4">
                              Drag and drop your file here, or click to browse
                            </p>
                            <p className="text-green-600 text-xs mb-4">
                              Supported formats: PDF, TXT, DOC, DOCX (max 0.5MB)
                            </p>
                          </div>
                          
                          <div>
                            <input
                              type="file"
                              id="document-upload"
                              className="hidden"
                              accept=".pdf,.txt,.doc,.docx"
                              onChange={handleDocumentUpload}
                            />
                            <label
                              htmlFor="document-upload"
                              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 cursor-pointer"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              Choose File
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Document Chat Interface */
                      <div className="space-y-4">
                        {/* Document Info */}
                        <div className="bg-white/70 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="font-semibold text-green-900">{uploadedDocument.name}</h4>
                                <p className="text-sm text-green-700">
                                  {(uploadedDocument.size / 1024 / 1024).toFixed(2)} MB • Ready for chat
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={removeDocument}
                              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Remove document"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Chat Messages */}
                        {documentChatOpen && (
                          <div className="bg-white/70 border border-green-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                            <div className="space-y-3">
                              {chatMessages.map((message, index) => (
                                <div
                                  key={index}
                                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                      message.role === 'user'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    <p className="text-sm">{message.content}</p>
                                  </div>
                                </div>
                              ))}
                              
                              {isProcessing && (
                                <div className="flex justify-start">
                                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                      <span className="text-sm">AI is thinking...</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Chat Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ask a question about your document..."
                            className="flex-1 px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                            disabled={isProcessing}
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={!currentMessage.trim() || isProcessing}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        </div>
        )}

        {/* MLOps Section - Show when mlops nav is active */}
        {activeNavItem === 'mlops' && (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl p-6">
        <Collapsible open={mlopsOpen} onOpenChange={(open: boolean) => setMlopsOpen(open)}>
          <CollapsibleTrigger asChild>
            <div className="bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 border-2 border-purple-300 rounded-xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600 rounded-lg shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-purple-900">
                      ⚙️ MLOps (Machine Learning Operations)
                    </h2>
                    <p className="text-sm text-purple-600">End-to-End ML Lifecycle Management & Automation</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-purple-700 font-medium">
                    {mlopsOpen ? 'Hide MLOps Guide' : 'Show MLOps Guide'}
                  </span>
                  {mlopsOpen ? (
                    <ChevronUp className="h-5 w-5 text-purple-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-purple-600" />
                  )}
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 shadow-sm">
              <div className="space-y-6">
                {/* MLOps Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    What is MLOps?
                  </h3>
                  <p className="text-purple-700 leading-relaxed mb-4">
                    {knowledgeLevel <= 2 ? (
                      "MLOps (Machine Learning Operations) is like having a smart factory for AI models! It's a set of practices that help teams build, test, deploy, and maintain machine learning models automatically. Think of it as the assembly line that takes your AI from the lab to real-world applications, making sure everything runs smoothly and efficiently."
                    ) : knowledgeLevel <= 4 ? (
                      "MLOps is a set of practices that combines Machine Learning, DevOps, and Data Engineering to automate and streamline the ML lifecycle. It includes model versioning, automated testing, continuous integration/deployment, monitoring, and governance to ensure reliable, scalable ML systems in production."
                    ) : (
                      "MLOps encompasses the entire ML lifecycle with automated pipelines for data ingestion, feature engineering, model training, validation, deployment, monitoring, and governance. It implements CI/CD/CT (Continuous Training), model registry, experiment tracking, data lineage, drift detection, and automated retraining for enterprise-scale ML operations."
                    )}
                  </p>
                </div>

                {/* MLOps Components */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-.42-.94l1.329-2.05a2 2 0 00-.5-2.5L15.5 8.5a2 2 0 00-2.5-.5l-2.05 1.329a6 6 0 00-.94-.42l-.477-2.387a2 2 0 00-1.953-1.522H6.5a2 2 0 00-1.953 1.522l-.477 2.387a6 6 0 00-.94.42L1.08 7.5a2 2 0 00-2.5.5L-2.5 9.5a2 2 0 00-.5 2.5l1.329 2.05a6 6 0 00-.42.94l-2.387.477A2 2 0 00-5 17.5v1.077a2 2 0 001.522 1.953l2.387.477a6 6 0 00.42.94L.658 23.92a2 2 0 00.5 2.5L2.5 27.5a2 2 0 002.5.5l2.05-1.329a6 6 0 00.94.42l.477 2.387A2 2 0 0010.5 30h1.077a2 2 0 001.953-1.522l.477-2.387a6 6 0 00.94-.42l2.05 1.329a2 2 0 002.5-.5L20.5 25.5a2 2 0 00.5-2.5l-1.329-2.05a6 6 0 00.42-.94l2.387-.477A2 2 0 0023 17.5v-1.077a2 2 0 00-1.522-1.953z"/>
                    </svg>
                    Key MLOps Components
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <h4 className="font-semibold text-purple-800">CI/CD/CT Pipelines</h4>
                      </div>
                      <p className="text-sm text-purple-700">Continuous Integration, Deployment, and Training automation</p>
                    </div>
                    
                    <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <h4 className="font-semibold text-purple-800">Model Registry & Versioning</h4>
                      </div>
                      <p className="text-sm text-purple-700">Centralized model storage, versioning, and metadata management</p>
                    </div>
                    
                    <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <h4 className="font-semibold text-purple-800">Monitoring & Observability</h4>
                      </div>
                      <p className="text-sm text-purple-700">Model performance, data drift, and system health monitoring</p>
                    </div>
                    
                    <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <h4 className="font-semibold text-purple-800">Feature Store</h4>
                      </div>
                      <p className="text-sm text-purple-700">Centralized feature management and serving infrastructure</p>
                    </div>
                  </div>
                </div>

                {/* MLOps Implementation Steps */}
                <div>
                  <Collapsible open={mlopsImplementationOpen} onOpenChange={(open: boolean) => setMlopsImplementationOpen(open)}>
                    <CollapsibleTrigger asChild>
                      <div className="cursor-pointer hover:bg-purple-50 p-3 rounded-lg transition-colors duration-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            MLOps Implementation Steps
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-purple-700 font-medium">
                              {mlopsImplementationOpen ? 'Hide Steps' : 'Show Steps'}
                            </span>
                            {mlopsImplementationOpen ? (
                              <ChevronUp className="h-4 w-4 text-purple-600" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-purple-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          1
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-purple-800 mb-2">Establish Data Pipeline</h5>
                          <p className="text-sm text-purple-700 mb-3">
                            Set up automated data ingestion, validation, preprocessing, and feature engineering pipelines. Implement data quality checks and lineage tracking.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Data Ingestion</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Data Validation</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Feature Engineering</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Data Lineage</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          2
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-purple-800 mb-2">Implement Model Training Pipeline</h5>
                          <p className="text-sm text-purple-700 mb-3">
                            Create automated model training workflows with experiment tracking, hyperparameter tuning, and model validation. Set up model registry for versioning.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Experiment Tracking</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Hyperparameter Tuning</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Model Registry</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Automated Training</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          3
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-purple-800 mb-2">Set Up CI/CD for ML</h5>
                          <p className="text-sm text-purple-700 mb-3">
                            Implement continuous integration and deployment pipelines for ML code, models, and infrastructure. Include automated testing and validation gates.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">CI/CD Pipelines</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Automated Testing</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Model Validation</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Infrastructure as Code</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          4
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-purple-800 mb-2">Deploy Model Serving Infrastructure</h5>
                          <p className="text-sm text-purple-700 mb-3">
                            Set up scalable model serving infrastructure with load balancing, auto-scaling, and A/B testing capabilities. Implement model deployment strategies.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Model Serving</span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Load Balancing</span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">A/B Testing</span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Canary Deployment</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          5
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-purple-800 mb-2">Implement Monitoring & Observability</h5>
                          <p className="text-sm text-purple-700 mb-3">
                            Deploy comprehensive monitoring for model performance, data drift, system metrics, and business KPIs. Set up alerting and automated responses.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">Performance Monitoring</span>
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">Data Drift Detection</span>
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">Alerting</span>
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">Observability</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 6 */}
                    <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          6
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-purple-800 mb-2">Establish Governance & Compliance</h5>
                          <p className="text-sm text-purple-700 mb-3">
                            Implement model governance, compliance frameworks, audit trails, and automated retraining triggers. Ensure regulatory compliance and ethical AI practices.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Model Governance</span>
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Compliance</span>
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Audit Trails</span>
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Ethical AI</span>
                          </div>
                        </div>
                      </div>
                    </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* Popular Tools */}
                <div className="bg-white/60 rounded-lg border border-purple-200 p-4">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Popular MLOps Tools & Platforms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">MLflow</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Kubeflow</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">DVC (Data Version Control)</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Weights & Biases</span>
                    <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium">Neptune</span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">Apache Airflow</span>
                    <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">Seldon Core</span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">BentoML</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Feast (Feature Store)</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Great Expectations</span>
                  </div>
                </div>

                {/* MLflow Production Pipeline Section */}
                <div className="border-t border-purple-300 pt-6 mt-6">
                  <Collapsible open={mlflowPipelinesOpen} onOpenChange={(open: boolean) => setMlflowPipelinesOpen(open)}>
                    <CollapsibleTrigger asChild>
                      <div className="cursor-pointer hover:bg-purple-50 p-3 rounded-lg transition-colors duration-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            🚀 Production-Ready MLflow ML Pipeline
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-purple-700 font-medium">
                              {mlflowPipelinesOpen ? 'Hide MLflow Guide' : 'Show MLflow Guide'}
                            </span>
                            {mlflowPipelinesOpen ? (
                              <ChevronUp className="h-4 w-4 text-purple-600" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-purple-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-4">
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 shadow-sm">
                        <div className="space-y-6">
                          {/* MLflow Overview */}
                          <div>
                            <h4 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
                              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              MLflow Production Pipeline Overview
                            </h4>
                            <p className="text-purple-700 leading-relaxed mb-4">
                              MLflow provides a comprehensive platform for managing the complete machine learning lifecycle, including experimentation, reproducibility, deployment, and model registry. This production-ready pipeline demonstrates end-to-end MLOps practices with automated tracking, model versioning, and deployment capabilities.
                            </p>
                          </div>

                          {/* Pipeline Architecture */}
                          <div>
                            <h4 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
                              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-.42-.94l1.329-2.05a2 2 0 00-.5-2.5L15.5 8.5a2 2 0 00-2.5-.5l-2.05 1.329a6 6 0 00-.94-.42l-.477-2.387a2 2 0 00-1.953-1.522H6.5a2 2 0 00-1.953 1.522l-.477 2.387a6 6 0 00-.94.42L1.08 7.5a2 2 0 00-2.5.5L-2.5 9.5a2 2 0 00-.5 2.5l1.329 2.05a6 6 0 00-.42.94l-2.387.477A2 2 0 00-5 17.5v1.077a2 2 0 001.522 1.953l2.387.477a6 6 0 00.42.94L.658 23.92a2 2 0 00.5 2.5L2.5 27.5a2 2 0 002.5.5l2.05-1.329a6 6 0 00.94.42l.477 2.387A2 2 0 0010.5 30h1.077a2 2 0 001.953-1.522l.477-2.387a6 6 0 00.94-.42l2.05 1.329a2 2 0 002.5-.5L20.5 25.5a2 2 0 00.5-2.5l-1.329-2.05a6 6 0 00.42-.94l2.387-.477A2 2 0 0023 17.5v-1.077a2 2 0 00-1.522-1.953z"/>
                              </svg>
                              Pipeline Components
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <h5 className="font-semibold text-purple-800">Experiment Tracking</h5>
                                </div>
                                <p className="text-sm text-purple-700">Automatic logging of parameters, metrics, and artifacts</p>
                              </div>
                              
                              <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                  <h5 className="font-semibold text-purple-800">Model Registry</h5>
                                </div>
                                <p className="text-sm text-purple-700">Centralized model versioning and lifecycle management</p>
                              </div>
                              
                              <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                  <h5 className="font-semibold text-purple-800">Model Deployment</h5>
                                </div>
                                <p className="text-sm text-purple-700">Automated deployment to various serving platforms</p>
                              </div>
                              
                              <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                  <h5 className="font-semibold text-purple-800">Pipeline Orchestration</h5>
                                </div>
                                <p className="text-sm text-purple-700">Automated workflow execution and scheduling</p>
                              </div>
                              
                              <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                                  <h5 className="font-semibold text-purple-800">Model Monitoring</h5>
                                </div>
                                <p className="text-sm text-purple-700">Performance tracking and drift detection</p>
                              </div>
                              
                              <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                  <h5 className="font-semibold text-purple-800">CI/CD Integration</h5>
                                </div>
                                <p className="text-sm text-purple-700">Seamless integration with DevOps workflows</p>
                              </div>
                            </div>
                          </div>

                          {/* Implementation Steps */}
                          <div>
                            <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              Implementation Steps & Code Examples
                            </h4>
                            
                            <div className="space-y-4">
                              {/* Step 1: Environment Setup */}
                              <Collapsible open={mlflowCodeOpen.setup} onOpenChange={(open: boolean) => setMlflowCodeOpen({...mlflowCodeOpen, setup: open})}>
                                <CollapsibleTrigger asChild>
                                  <Button variant="outline" className="w-full flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                                      <span>Environment Setup & Configuration</span>
                                    </div>
                                    {mlflowCodeOpen.setup ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-4">
                                  <div className="bg-gray-900 rounded-lg p-4 border border-purple-300">
                                    <div className="flex items-center gap-2 mb-3">
                                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                      </svg>
                                      <h5 className="text-green-400 font-semibold">MLflow Environment Setup</h5>
                                    </div>
                                    <pre className="text-green-300 text-xs overflow-x-auto leading-relaxed">
{`# requirements.txt
mlflow>=2.8.0
scikit-learn>=1.3.0
pandas>=2.0.0
numpy>=1.24.0
boto3>=1.28.0  # For AWS S3 artifact storage
psycopg2-binary>=2.9.0  # For PostgreSQL backend store
docker>=6.0.0
kubernetes>=27.0.0

# Install dependencies
pip install -r requirements.txt

# MLflow Configuration (mlflow_config.py)
import os
import mlflow
from mlflow.tracking import MlflowClient

class MLflowConfig:
    def __init__(self):
        # Set MLflow tracking URI (can be local, remote server, or cloud)
        self.tracking_uri = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
        self.experiment_name = os.getenv("MLFLOW_EXPERIMENT_NAME", "production_pipeline")
        self.model_registry_uri = os.getenv("MLFLOW_REGISTRY_URI", self.tracking_uri)
        
        # AWS S3 configuration for artifact storage
        self.s3_bucket = os.getenv("MLFLOW_S3_BUCKET", "mlflow-artifacts-bucket")
        self.aws_region = os.getenv("AWS_DEFAULT_REGION", "us-west-2")
        
        # Database backend store configuration
        self.db_uri = os.getenv("MLFLOW_DB_URI", 
                               "postgresql://mlflow:password@localhost:5432/mlflow")
    
    def setup_mlflow(self):
        """Initialize MLflow configuration"""
        mlflow.set_tracking_uri(self.tracking_uri)
        mlflow.set_registry_uri(self.model_registry_uri)
        
        # Create or get experiment
        try:
            experiment_id = mlflow.create_experiment(
                self.experiment_name,
                artifact_location=f"s3://{self.s3_bucket}/experiments/"
            )
        except mlflow.exceptions.MlflowException:
            experiment_id = mlflow.get_experiment_by_name(self.experiment_name).experiment_id
        
        mlflow.set_experiment(experiment_id=experiment_id)
        return experiment_id

# Docker Compose for MLflow Server (docker-compose.yml)
version: '3.8'
services:
  mlflow-db:
    image: postgres:13
    environment:
      POSTGRES_DB: mlflow
      POSTGRES_USER: mlflow
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    
  mlflow-server:
    image: python:3.9-slim
    depends_on:
      - mlflow-db
    ports:
      - "5000:5000"
    environment:
      - MLFLOW_S3_ENDPOINT_URL=https://s3.amazonaws.com
      - AWS_ACCESS_KEY_ID=your_access_key
      - AWS_SECRET_ACCESS_KEY=your_secret_key
    command: >
      bash -c "
        pip install mlflow psycopg2-binary boto3 &&
        mlflow server 
        --backend-store-uri postgresql://mlflow:password@mlflow-db:5432/mlflow
        --default-artifact-root s3://mlflow-artifacts-bucket/
        --host 0.0.0.0
        --port 5000
      "
    
volumes:
  postgres_data:`}
                                    </pre>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>

                              {/* Additional steps would continue here but truncated for brevity */}
                              <div className="text-center py-4">
                                <p className="text-purple-600 text-sm">
                                  📝 Complete implementation includes 5 comprehensive steps with full code examples
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Best Practices */}
                          <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                              Production Best Practices
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-purple-700">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Automated experiment tracking</span>
                              </div>
                              <div className="flex items-center gap-2 text-purple-700">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span>Model registry & versioning</span>
                              </div>
                              <div className="flex items-center gap-2 text-purple-700">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span>Automated deployment pipelines</span>
                              </div>
                              <div className="flex items-center gap-2 text-purple-700">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span>Real-time monitoring & alerting</span>
                              </div>
                              <div className="flex items-center gap-2 text-purple-700">
                                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                <span>Data drift detection</span>
                              </div>
                              <div className="flex items-center gap-2 text-purple-700">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                <span>A/B testing capabilities</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        </div>
        )}

        {/* Resources Section - Show when resources nav is active */}
        {activeNavItem === 'resources' && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 rounded-2xl p-6">
        <div className="bg-gradient-to-r from-gray-100 via-slate-100 to-zinc-100 border-2 border-gray-300 rounded-xl p-6 shadow-lg">
          <div className="text-center space-y-4">
            <div className="p-4 bg-indigo-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              📚 Learning Resources
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Additional learning materials, documentation, and external resources to deepen your machine learning knowledge.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <h3 className="font-semibold text-gray-900 mb-2">📖 Documentation</h3>
                <p className="text-sm text-gray-600 mb-3">Comprehensive guides and API references for each algorithm.</p>
                <span className="text-xs text-blue-600 font-medium">Coming Soon</span>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <h3 className="font-semibold text-gray-900 mb-2">🎥 Video Tutorials</h3>
                <p className="text-sm text-gray-600 mb-3">Step-by-step video explanations of ML concepts and implementations.</p>
                <span className="text-xs text-blue-600 font-medium">Coming Soon</span>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <h3 className="font-semibold text-gray-900 mb-2">📊 Datasets</h3>
                <p className="text-sm text-gray-600 mb-3">Curated datasets for practicing with different ML algorithms.</p>
                <span className="text-xs text-blue-600 font-medium">Coming Soon</span>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <h3 className="font-semibold text-gray-900 mb-2">🔗 External Links</h3>
                <p className="text-sm text-gray-600 mb-3">Curated links to research papers, articles, and other resources.</p>
                <span className="text-xs text-blue-600 font-medium">Coming Soon</span>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <h3 className="font-semibold text-gray-900 mb-2">💻 Code Examples</h3>
                <p className="text-sm text-gray-600 mb-3">Additional code examples and implementation patterns.</p>
                <span className="text-xs text-blue-600 font-medium">Coming Soon</span>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <h3 className="font-semibold text-gray-900 mb-2">🎯 Practice Problems</h3>
                <p className="text-sm text-gray-600 mb-3">Hands-on exercises to test your understanding.</p>
                <span className="text-xs text-blue-600 font-medium">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
        </div>
        )}

        </div>
      </main>

      {/* Enhanced Footer Section */}
      <footer className="mt-16 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Brain className="h-8 w-8 text-blue-400" />
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    ML Learning Hub
                  </h3>
                  <p className="text-xs text-gray-300">Interactive AI/ML Platform</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Explore, learn, and implement machine learning algorithms with interactive tutorials, 
                real-time parameter tuning, and production-ready code examples.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.linkedin.com/in/ahmadziyad/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                  title="LinkedIn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a 
                  href="https://portfolio-ahmad-ten.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200"
                  title="Portfolio"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </a>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  title="GitHub"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Quick Links</h4>
              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveNavItem('algorithms')}
                  className="block text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  ML Algorithms
                </button>
                <button 
                  onClick={() => setActiveNavItem('pipelines')}
                  className="block text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  ML Pipelines
                </button>
                <button 
                  onClick={() => setActiveNavItem('rag')}
                  className="block text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  RAG Systems
                </button>
                <button 
                  onClick={() => setActiveNavItem('resources')}
                  className="block text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Resources
                </button>
              </nav>
            </div>

            {/* Learning Resources */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Learning Resources</h4>
              <div className="space-y-2">
                <div className="text-sm text-gray-300">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Interactive Tutorials</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Code Examples</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Production Pipelines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span>Real-time Visualizations</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Stay Updated</h4>
              <p className="text-sm text-gray-300">
                Get notified about new algorithms, features, and ML insights.
              </p>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium">
                    Subscribe
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  No spam, unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Developer Attribution */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">Developed by</span>
                  <span className="font-semibold text-blue-400">Ahmad Ziyad</span>
                </div>
                <div className="hidden md:block w-px h-4 bg-gray-600"></div>
                <div className="text-gray-400 text-xs">
                  Full Stack Developer & ML Engineer
                </div>
              </div>

              {/* Tech Stack */}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span>Built with:</span>
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded">React</span>
                    <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded">TypeScript</span>
                    <span className="px-2 py-1 bg-cyan-900/50 text-cyan-300 rounded">Tailwind</span>
                  </div>
                </div>
              </div>

              {/* Copyright */}
              <div className="text-xs text-gray-400">
                © 2024 Interactive AL ML Learning Hub. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MLShowcase;
