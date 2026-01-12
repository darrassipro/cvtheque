'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { openRegisterModal } from '@/lib/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Upload, 
  Search, 
  Brain, 
  Shield, 
  Zap, 
  CheckCircle,
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
              Intelligent CV Management
              <span className="block text-blue-600">Powered by AI</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload, analyze, and manage CVs with advanced AI extraction. 
              Streamline your recruitment process with CVTech.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              {isAuthenticated ? (
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/cvs">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="text-lg px-8"
                    onClick={() => dispatch(openRegisterModal())}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-lg px-8">
                    <Link href="#features">Learn More</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to manage CVs efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Easy Upload</h3>
                <p className="text-gray-600">
                  Upload CVs in PDF, DOCX, or image formats. Drag and drop or browse to upload.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">AI Extraction</h3>
                <p className="text-gray-600">
                  Advanced AI automatically extracts personal info, skills, experience, and more.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Smart Search</h3>
                <p className="text-gray-600">
                  Search and filter CVs by skills, experience, education, and custom criteria.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Secure Storage</h3>
                <p className="text-gray-600">
                  Enterprise-grade security with encrypted storage and access control.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Fast Processing</h3>
                <p className="text-gray-600">
                  Process multiple CVs simultaneously with lightning-fast AI analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Export Options</h3>
                <p className="text-gray-600">
                  Export extracted data in JSON, PDF, or integrate with your existing systems.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple three-step process to manage CVs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold">Upload CV</h3>
              <p className="text-gray-600">
                Upload a CV in any supported format. Our system accepts PDF, DOCX, and images.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold">AI Processing</h3>
              <p className="text-gray-600">
                Our AI automatically extracts and structures all relevant information from the CV.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold">Search & Manage</h3>
              <p className="text-gray-600">
                Search, filter, and manage your CV database with powerful tools and insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 px-4 bg-blue-600">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of companies using CVTech to streamline their recruitment process.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8"
              onClick={() => dispatch(openRegisterModal())}
            >
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
