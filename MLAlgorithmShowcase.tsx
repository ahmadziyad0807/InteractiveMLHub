import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Brain, Play, Code2, BarChart3, Settings, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

export const MLShowcase = () => {
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
  const [xgbResult, setXgbResult] = useState<any>(null);
  const [xgbLoading, setXgbLoading] = useState(false);

  // k-NN state
  const [knnParams, setKnnParams] = useState({
    nNeighbors: 5,
    weights: "uniform",
    algorithm: "auto",
  });
  const [knnResult, setKnnResult] = useState<any>(null);
  const [knnLoading, setKnnLoading] = useState(false);

  // Linear Learner state
  const [linearParams, setLinearParams] = useState({
    learningRate: 0.01,
    epochs: 100,
    regularization: 0.01,
  });
  const [linearResult, setLinearResult] = useState<any>(null);
  const [linearLoading, setLinearLoading] = useState(false);

  // Random Forest state
  const [rfParams, setRfParams] = useState({
    nEstimators: 100,
    maxDepth: 10,
    minSamplesSplit: 2,
    maxFeatures: "sqrt",
  });
  const [rfResult, setRfResult] = useState<any>(null);
  const [rfLoading, setRfLoading] = useState(false);

  // SVM state
  const [svmParams, setSvmParams] = useState({
    kernel: "rbf",
    c: 1.0,
    gamma: "scale",
  });
  const [svmResult, setSvmResult] = useState<any>(null);
  const [svmLoading, setSvmLoading] = useState(false);

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
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Interactive AL ML Learning Hub is a hands-on platform for exploring machine learning algorithms through real-time experimentation. 
            It offers interactive model training, parameter tuning, and performance evaluation using popular techniques like XGBoost, k-NN, 
            Linear Models, Random Forests, and SVM—making ML concepts practical, visual, and easy to understand.
          </p>
        </div>

      <div className="space-y-6">
      <Tabs defaultValue="xgboost" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="xgboost">XGBoost</TabsTrigger>
          <TabsTrigger value="knn">k-NN</TabsTrigger>
          <TabsTrigger value="linear">Linear Learner</TabsTrigger>
          <TabsTrigger value="rf">Random Forest</TabsTrigger>
          <TabsTrigger value="svm">SVM</TabsTrigger>
        </TabsList>

        {/* XGBoost Tab */}
        <TabsContent value="xgboost" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                XGBoost (Extreme Gradient Boosting)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">
                  XGBoost is an optimized distributed gradient boosting library designed to be highly efficient, 
                  flexible and portable. It implements machine learning algorithms under the Gradient Boosting framework.
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
                      onValueChange={(v) => setXgbParams({...xgbParams, maxDepth: v[0]})}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Learning Rate: {xgbParams.learningRate}</Label>
                    <Slider
                      value={[xgbParams.learningRate * 10]}
                      onValueChange={(v) => setXgbParams({...xgbParams, learningRate: v[0] / 10})}
                      min={0.1}
                      max={10}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>N Estimators: {xgbParams.nEstimators}</Label>
                    <Slider
                      value={[xgbParams.nEstimators]}
                      onValueChange={(v) => setXgbParams({...xgbParams, nEstimators: v[0]})}
                      min={10}
                      max={500}
                      step={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subsample: {xgbParams.subsample}</Label>
                    <Slider
                      value={[xgbParams.subsample * 10]}
                      onValueChange={(v) => setXgbParams({...xgbParams, subsample: v[0] / 10})}
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
              <Collapsible open={codeOpen.xgboost} onOpenChange={(open) => setCodeOpen({...codeOpen, xgboost: open})}>
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
                    </div>
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
                          <p className="text-2xl font-bold text-primary">{(xgbResult.accuracy * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Accuracy</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{(xgbResult.precision * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Precision</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{(xgbResult.recall * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Recall</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{(xgbResult.f1Score * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">F1-Score</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h5 className="font-semibold mb-3">Feature Importance</h5>
                    <div className="space-y-2">
                      {xgbResult.featureImportance.map((item: any, idx: number) => (
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
        <TabsContent value="knn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                k-Nearest Neighbors (k-NN) Algorithm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">
                  k-NN is a simple, instance-based learning algorithm that stores all available cases and classifies 
                  new data points based on a similarity measure (e.g., distance functions). It's a non-parametric method.
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
                      onValueChange={(v) => setKnnParams({...knnParams, nNeighbors: v[0]})}
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
              <Collapsible open={codeOpen.knn} onOpenChange={(open) => setCodeOpen({...codeOpen, knn: open})}>
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
                    </div>
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
                          <p className="text-2xl font-bold text-primary">{(knnResult.accuracy * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Accuracy</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{(knnResult.precision * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Precision</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{(knnResult.recall * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Recall</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{(knnResult.f1Score * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">F1-Score</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h5 className="font-semibold mb-3">Confusion Matrix</h5>
                    <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                      {knnResult.confusionMatrix.map((row: number[], i: number) => 
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
        <TabsContent value="linear" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Linear Learner Algorithm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">
                  Linear Learner is a supervised learning algorithm used for solving regression and classification problems. 
                  It learns a linear function that best fits the training data by minimizing a loss function.
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
                      onValueChange={(v) => setLinearParams({...linearParams, learningRate: v[0] / 100})}
                      min={0.1}
                      max={10}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Epochs: {linearParams.epochs}</Label>
                    <Slider
                      value={[linearParams.epochs]}
                      onValueChange={(v) => setLinearParams({...linearParams, epochs: v[0]})}
                      min={10}
                      max={1000}
                      step={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Regularization (α): {linearParams.regularization}</Label>
                    <Slider
                      value={[linearParams.regularization * 100]}
                      onValueChange={(v) => setLinearParams({...linearParams, regularization: v[0] / 100})}
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
              <Collapsible open={codeOpen.linear} onOpenChange={(open) => setCodeOpen({...codeOpen, linear: open})}>
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
                    </div>
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
                          <p className="text-2xl font-bold text-primary">{linearResult.mse.toFixed(3)}</p>
                          <p className="text-xs text-muted-foreground">MSE</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{linearResult.rmse.toFixed(3)}</p>
                          <p className="text-xs text-muted-foreground">RMSE</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{(linearResult.r2Score * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">R² Score</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{linearResult.mae.toFixed(3)}</p>
                          <p className="text-xs text-muted-foreground">MAE</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h5 className="font-semibold mb-3">Model Weights</h5>
                    <div className="space-y-2">
                      {linearResult.weights.map((weight: number, idx: number) => (
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
        <TabsContent value="rf" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Random Forest Algorithm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">
                  Random Forest is an ensemble learning method that creates multiple decision trees during training
                  and outputs the mode of classes (classification) or mean prediction (regression) of individual trees.
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
                      onValueChange={(v) => setRfParams({...rfParams, nEstimators: v[0]})}
                      min={10}
                      max={500}
                      step={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Depth: {rfParams.maxDepth}</Label>
                    <Slider
                      value={[rfParams.maxDepth]}
                      onValueChange={(v) => setRfParams({...rfParams, maxDepth: v[0]})}
                      min={1}
                      max={30}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Min Samples Split: {rfParams.minSamplesSplit}</Label>
                    <Slider
                      value={[rfParams.minSamplesSplit]}
                      onValueChange={(v) => setRfParams({...rfParams, minSamplesSplit: v[0]})}
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
              <Collapsible open={codeOpen.rf} onOpenChange={(open) => setCodeOpen({...codeOpen, rf: open})}>
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
                    </div>
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
                          <p className="text-2xl font-bold text-primary">{(rfResult.accuracy * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Accuracy</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{(rfResult.precision * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Precision</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{(rfResult.recall * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Recall</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{(rfResult.oobScore * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">OOB Score</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h5 className="font-semibold mb-3">Feature Importance</h5>
                    <div className="space-y-2">
                      {rfResult.featureImportance.map((item: any, idx: number) => (
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
        <TabsContent value="svm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Support Vector Machine (SVM)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">
                  SVM is a powerful supervised learning algorithm used for classification and regression. It finds the optimal 
                  hyperplane that maximally separates different classes in the feature space using support vectors.
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
                      onValueChange={(v) => setSvmParams({...svmParams, c: v[0] / 10})}
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
              <Collapsible open={codeOpen.svm} onOpenChange={(open) => setCodeOpen({...codeOpen, svm: open})}>
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
                    </div>
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
                          <p className="text-2xl font-bold text-primary">{(svmResult.accuracy * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Accuracy</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{(svmResult.precision * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Precision</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{(svmResult.recall * 100).toFixed(1)}%</p>
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
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <span className="text-sm">Developed by</span>
              <span className="font-semibold text-blue-600">Ahmad Ziyad</span>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-sm">
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
