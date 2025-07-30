/**
 * AI Assistant Component
 * Provides intelligent suggestions for form building based on tender type and context
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle, 
  Loader,
  MessageSquare,
  FileText,
  Settings,
  Zap
} from 'lucide-react';
import { FormTemplate, AISuggestion, FieldType } from '../types';
import { TENDER_FIELD_TEMPLATES, TENDER_SECTION_TEMPLATES } from '../utils/field-factory';

interface AIAssistantProps {
  template: FormTemplate;
  onClose: () => void;
  onApplySuggestion: (suggestion: AISuggestion) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  template,
  onClose,
  onApplySuggestion
}) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'chat' | 'analysis'>('suggestions');
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  // Generate AI suggestions based on template
  const generateSuggestions = async () => {
    setIsLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newSuggestions: AISuggestion[] = [
      {
        id: '1',
        type: 'field',
        title: 'Add Company Registration Number',
        description: 'Most tender applications require a company registration number for verification.',
        confidence: 0.95,
        implementation: {
          field: {
            id: 'company_registration',
            type: 'text' as FieldType,
            label: 'Company Registration Number',
            placeholder: 'Enter your company registration number',
            required: true,
            validation: [
              {
                type: 'required',
                message: 'Company registration number is required'
              },
              {
                type: 'pattern',
                value: '^[A-Z0-9]{6,12}$',
                message: 'Please enter a valid registration number'
              }
            ]
          }
        }
      },
      {
        id: '2',
        type: 'section',
        title: 'Add Financial Information Section',
        description: 'Include financial statements and bank references for tender evaluation.',
        confidence: 0.88,
        implementation: {
          section: {
            id: 'financial_info',
            title: 'Financial Information',
            description: 'Provide financial statements and bank references',
            fields: [
              TENDER_FIELD_TEMPLATES.tenderValue,
              {
                id: 'bank_reference',
                type: 'textarea' as FieldType,
                label: 'Bank Reference',
                placeholder: 'Enter bank reference details',
                required: true,
                settings: { rows: 3 }
              }
            ]
          }
        }
      },
      {
        id: '3',
        type: 'validation',
        title: 'Add Email Validation',
        description: 'Ensure email addresses are properly validated.',
        confidence: 0.92,
        implementation: {
          validation: {
            type: 'email',
            message: 'Please enter a valid email address'
          }
        }
      }
    ];
    
    setSuggestions(newSuggestions);
    setIsLoading(false);
  };

  // Handle chat message
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user' as const, content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant' as const,
        content: `I understand you're asking about "${chatInput}". Let me help you with that. Based on your form template, I can suggest some improvements...`
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  // Analyze form template
  const analyzeTemplate = async () => {
    setIsLoading(true);
    
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysisResult = {
      completeness: 75,
      bestPractices: [
        'Form has good structure with sections',
        'Required fields are properly marked',
        'Consider adding conditional logic'
      ],
      improvements: [
        'Add more validation rules',
        'Include file upload for documents',
        'Add progress indicator for multi-step'
      ],
      accessibility: 80,
      mobileOptimization: 85
    };
    
    setAnalysis(analysisResult);
    setIsLoading(false);
  };

  // Apply suggestion
  const handleApplySuggestion = (suggestion: AISuggestion) => {
    onApplySuggestion(suggestion);
  };

  // Load initial data
  useEffect(() => {
    generateSuggestions();
    analyzeTemplate();
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-semibold">AI Assistant</h2>
                <p className="text-sm text-purple-100">
                  Intelligent suggestions for your form
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {[
                { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
                { id: 'chat', label: 'Chat', icon: MessageSquare },
                { id: 'analysis', label: 'Analysis', icon: FileText }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center space-x-2 py-3 border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              {activeTab === 'suggestions' && (
                <motion.div
                  key="suggestions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {isLoading ? (
                    <div className="text-center py-8">
                      <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                      <p className="text-gray-600">Generating intelligent suggestions...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {suggestions.map((suggestion) => (
                        <motion.div
                          key={suggestion.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Lightbulb className="w-4 h-4 text-purple-600" />
                                <h3 className="font-medium text-gray-900">
                                  {suggestion.title}
                                </h3>
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                  {Math.round(suggestion.confidence * 100)}% confidence
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">
                                {suggestion.description}
                              </p>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleApplySuggestion(suggestion)}
                                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Apply</span>
                                </button>
                                <button className="text-sm text-gray-500 hover:text-gray-700">
                                  Learn more
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="chat-messages space-y-4 max-h-96 overflow-y-auto">
                    {chatMessages.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">Start a conversation with the AI assistant</p>
                      </div>
                    )}
                    
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <form onSubmit={handleChatSubmit} className="flex space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask the AI assistant..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'analysis' && (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {isLoading ? (
                    <div className="text-center py-8">
                      <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                      <p className="text-gray-600">Analyzing your form...</p>
                    </div>
                  ) : analysis ? (
                    <div className="space-y-6">
                      {/* Overall Score */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Form Quality Score</h3>
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl font-bold text-green-600">
                            {analysis.completeness}%
                          </div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${analysis.completeness}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Best Practices */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Best Practices
                        </h3>
                        <div className="space-y-2">
                          {analysis.bestPractices.map((practice, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span>{practice}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Improvements */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                          <AlertCircle className="w-4 h-4 text-orange-600 mr-2" />
                          Suggested Improvements
                        </h3>
                        <div className="space-y-2">
                          {analysis.improvements.map((improvement, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                              <AlertCircle className="w-3 h-3 text-orange-500" />
                              <span>{improvement}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm text-gray-600">Accessibility</div>
                          <div className="text-2xl font-bold text-blue-600">{analysis.accessibility}%</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-sm text-gray-600">Mobile Optimization</div>
                          <div className="text-2xl font-bold text-green-600">{analysis.mobileOptimization}%</div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              AI Assistant powered by advanced machine learning
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={generateSuggestions}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-purple-700 bg-white border border-purple-300 rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Refresh Suggestions
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 