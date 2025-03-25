import React, { useState } from 'react';
import { MessageSquare, Phone, Pill, Car, Heart, Send, Loader2, CheckCircle, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyzeSymptoms } from './services/aiService';

interface ChatMessage {
  text: string;
  isAI: boolean;
}

function FeatureCard({ icon: Icon, title, description, onClick }: { 
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <div 
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-indigo-600" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function ChatInterface({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: "Hello! I'm your AI health assistant. Please describe your symptoms in detail (e.g., location, duration, severity) and I'll help analyze them. Remember, this is for informational purposes only - always consult a healthcare professional for proper diagnosis and treatment.", isAI: true }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setMessages(prev => [...prev, { text: message, isAI: false }]);
    setIsLoading(true);
    
    try {
      const aiResponse = await analyzeSymptoms(message);
      setMessages(prev => [...prev, { text: aiResponse, isAI: true }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        text: "I apologize, but I encountered an error while analyzing your symptoms. Please try again or consult a healthcare professional. If the problem persists, you can use our teleconsultation service to speak with a doctor directly.", 
        isAI: true 
      }]);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl h-[700px] flex flex-col shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center bg-indigo-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-indigo-900">AI Health Assistant</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}>
              <div className={`rounded-2xl px-6 py-3 max-w-[90%] shadow-sm ${
                msg.isAI 
                  ? 'bg-white border border-gray-200' 
                  : 'bg-indigo-600 text-white'
              }`}>
                <div className={`prose ${!msg.isAI && 'text-white'} max-w-none text-sm leading-relaxed markdown-content`}>
                  {msg.isAI ? (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold my-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-md font-bold my-2" {...props} />,
                        h4: ({node, ...props}) => <h4 className="text-base font-bold my-2" {...props} />,
                        p: ({node, ...props}) => <p className="my-2" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc ml-4 my-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal ml-4 my-2" {...props} />,
                        li: ({node, ...props}) => <li className="my-1" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-indigo-900" {...props} />,
                        em: ({node, ...props}) => <em className="italic" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 my-2 italic" {...props} />,
                        code: ({node, ...props}) => <code className="bg-gray-100 px-1 rounded" {...props} />,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
                <div className={`mt-2 text-xs ${msg.isAI ? 'text-gray-500' : 'text-indigo-100'}`}>
                  {msg.isAI ? 'AI Assistant' : 'You'}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-6 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  <span className="text-sm text-gray-600">Analyzing symptoms...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-white rounded-b-xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your symptoms in detail..."
              className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
              className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsultationForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    symptoms: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Schedule Teleconsultation</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {isSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-xl font-semibold mb-2">Consultation Scheduled!</h4>
            <p className="text-gray-600 mb-6">
              We'll send you a confirmation SMS with the meeting link.
            </p>
            <button
              onClick={onClose}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Symptoms
              </label>
              <textarea
                required
                value={formData.symptoms}
                onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                className="w-full border rounded-lg px-4 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                'Schedule Consultation'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function MedicineTracker({ onClose }: { onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines] = useState([
    { name: 'Paracetamol', availability: 'High', location: 'City Hospital Pharmacy' },
    { name: 'Amoxicillin', availability: 'Medium', location: 'Rural Health Center' },
    { name: 'Insulin', availability: 'Low', location: 'District Medical Store' },
    { name: 'Aspirin', availability: 'High', location: 'Community Clinic' },
  ]);

  const filteredMedicines = medicines.filter(med => 
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Medicine Availability Tracker</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="space-y-2">
            {filteredMedicines.map((med, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">{med.name}</h4>
                  <span className={`px-2 py-1 rounded text-sm ${
                    med.availability === 'High' ? 'bg-green-100 text-green-800' :
                    med.availability === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {med.availability}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{med.location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmergencyTransport({ onClose }: { onClose: () => void }) {
  const [location, setLocation] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleRequest = () => {
    if (!location.trim()) return;
    setIsRequesting(true);
    
    // Simulate finding a driver
    setTimeout(() => {
      setIsRequesting(false);
      setIsConfirmed(true);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Emergency Transport</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {isConfirmed ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-xl font-semibold mb-2">Driver Confirmed!</h4>
            <p className="text-gray-600 mb-2">
              Driver will arrive in approximately 10 minutes
            </p>
            <p className="text-gray-600 mb-6">
              Vehicle: White Toyota Innova (KA-01-AB-1234)
            </p>
            <button
              onClick={onClose}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your location"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleRequest}
              disabled={isRequesting || !location}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRequesting ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                'Request Emergency Transport'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const handleFeatureClick = (feature: string) => {
    setActiveFeature(feature);
  };

  const handleCloseFeature = () => {
    setActiveFeature(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Heart className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI Health Bridge
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Bridging healthcare gaps in rural communities through AI-powered solutions, 
            telehealth, and smart logistics.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => handleFeatureClick('chat')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </button>
            <button className="border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">1000+</div>
              <div className="text-gray-600">Villages Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">24/7</div>
              <div className="text-gray-600">AI Support</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">50k+</div>
              <div className="text-gray-600">Lives Impacted</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Our Solutions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={MessageSquare}
            title="AI Chatbot"
            description="24/7 symptom diagnosis and health guidance via SMS, making healthcare accessible to all."
            onClick={() => handleFeatureClick('chat')}
          />
          <FeatureCard
            icon={Phone}
            title="Teleconsultation"
            description="Connect with doctors remotely through low-bandwidth solutions with offline sync capabilities."
            onClick={() => handleFeatureClick('consultation')}
          />
          <FeatureCard
            icon={Pill}
            title="Medicine Tracker"
            description="Real-time tracking of medicine availability through NGO and government partnerships."
            onClick={() => handleFeatureClick('medicine')}
          />
          <FeatureCard
            icon={Car}
            title="Emergency Transport"
            description="AI-powered ride-sharing system for quick and reliable emergency transportation."
            onClick={() => handleFeatureClick('transport')}
          />
        </div>
      </div>

      {/* Impact Section */}
      <div className="bg-indigo-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Making Healthcare Accessible</h2>
            <div className="aspect-video rounded-xl overflow-hidden mb-8">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80" 
                alt="Rural healthcare" 
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-lg opacity-90">
              Our mission is to eliminate preventable deaths and improve health outcomes
              in rural communities by leveraging technology and human compassion.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center mb-4 md:mb-0">
              <Heart className="h-6 w-6 text-indigo-600 mr-2" />
              <span className="text-gray-900 font-semibold">AI Health Bridge</span>
            </div>
            <div className="text-gray-600">
              © 2025 AI Health Bridge. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Feature Modals */}
      {activeFeature === 'chat' && <ChatInterface onClose={handleCloseFeature} />}
      {activeFeature === 'consultation' && <ConsultationForm onClose={handleCloseFeature} />}
      {activeFeature === 'medicine' && <MedicineTracker onClose={handleCloseFeature} />}
      {activeFeature === 'transport' && <EmergencyTransport onClose={handleCloseFeature} />}
    </div>
  );
}

export default App;