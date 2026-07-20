import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function BuildHub() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) loadProjects();
    });
  }, []);

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert('Signup error: ' + error.message);
    else alert('Check your email to confirm signup');
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert('Login error: ' + error.message);
    else window.location.reload();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const generateWebsite = async () => {
    if (!prompt.trim()) {
      alert('Enter a description first');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-website', {
        body: { prompt },
      });
      if (error) throw error;
      setGeneratedHtml(data.html);
    } catch (err) {
      alert('Error generating website: ' + err.message);
    }
    setLoading(false);
  };

  const saveProject = async () => {
    if (!projectName.trim() || !generatedHtml) {
      alert('Enter project name and generate website first');
      return;
    }
    const { error } = await supabase.from('projects').insert([
      {
        user_id: user.id,
        project_name: projectName,
        website_html: generatedHtml,
      },
    ]);
    if (error) alert('Error saving project: ' + error.message);
    else {
      alert('Project saved!');
      setProjectName('');
      loadProjects();
    }
  };

  const loadProjects = async () => {
    const { data } = await supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setProjects(data || []);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">BuildHub</h1>
          <p className="text-slate-600 mb-8 text-lg">Professional Websites in Minutes</p>
          
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={signIn} 
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Sign In
            </button>
            <button 
              onClick={signUp} 
              className="w-full bg-slate-200 text-slate-900 py-3 rounded-lg font-semibold hover:bg-slate-300 transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">BuildHub</h1>
            <p className="text-sm text-slate-600">Professional Websites in Minutes</p>
          </div>
          <button 
            onClick={signOut} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Create Website</h2>
              <textarea
                placeholder="Describe the website you want (e.g., 'Professional barber shop with booking system')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              />
              <button
                onClick={generateWebsite}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Generating...' : 'Generate Website'}
              </button>
            </div>

            {generatedHtml && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Save Project</h2>
                <input
                  type="text"
                  placeholder="Project name (e.g., My Barber Shop)"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={saveProject}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Save Project
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Your Projects ({projects.length})</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {projects.length === 0 ? (
                  <p className="text-slate-600 text-center py-4">No projects yet. Create one!</p>
                ) : (
                  projects.map((proj) => (
  <div 
    key={proj.id} 
    className="p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition cursor-pointer"
    onClick={() => {
      setGeneratedHtml(proj.website_html);
      setProjectName(proj.project_name);
    }}
  >
    <p className="font-semibold text-slate-900">{proj.project_name}</p>
    <p className="text-xs text-slate-600">
      {new Date(proj.created_at).toLocaleDateString()}
    </p>
  </div>
))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Preview</h2>
            {generatedHtml ? (
              <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
                <iframe
                  srcDoc={generatedHtml}
                  title="Website Preview"
                  className="w-full h-96 border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 rounded-lg h-96 flex flex-col items-center justify-center bg-slate-50">
                <p className="text-slate-600 text-center">
                  Describe your website and click "Generate" to see it here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
