import React from 'react';
import { motion } from 'framer-motion';
import {
  User2, Mail, Building2, Star, Phone, Calendar, MapPin, Clock, FileText
} from 'lucide-react';

const CandidaturePage = () => {
  return (
    
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <h1 className="text-red-500">TEST</h1>

      
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">🎓 Suivi de Candidature</h1>
        <p className="text-slate-300">
          Gestion moderne et détaillée de votre candidature et des interactions associées.
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --------------------------- */}
        {/* 1. BIODATA DU CANDIDAT */}
        {/* --------------------------- */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-700"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User2 className="text-indigo-400" /> Informations du Candidat
          </h2>

          <div className="space-y-2">
            <p className="flex items-center gap-2"><Mail className="text-indigo-300" /> <strong>Email :</strong> test@gmail.com</p>
            <p className="flex items-center gap-2"><Phone className="text-indigo-300" /> <strong>Téléphone :</strong> +33 6 12 34 56 78</p>
            <p className="flex items-center gap-2"><MapPin className="text-indigo-300" /> <strong>Localisation :</strong> Paris</p>
          </div>
        </motion.div>


        {/* --------------------------- */}
        {/* 2. ENTREPRISE */}
        {/* --------------------------- */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-700"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building2 className="text-pink-400" /> Entreprise
          </h2>

          <div className="space-y-3">
            <p><strong>Nom :</strong> Opiice Connect</p>
            <p><strong>Secteur :</strong> Software</p>
            <p><strong>Taille :</strong> 50 – 200 employés</p>
          </div>
        </motion.div>


        {/* --------------------------- */}
        {/* 3. DETAILS DE LA CANDIDATURE */}
        {/* --------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-700"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="text-emerald-400" /> Détails de la candidature
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="flex items-center gap-2">
              <Calendar className="text-emerald-300" />
              <strong>Date d’envoi :</strong> 10 février 2025
            </p>
            <p className="flex items-center gap-2">
              <Star className="text-emerald-300" />
              <strong>Statut :</strong>
              <span className="ml-2 bg-emerald-600/30 px-3 py-1 rounded-full text-emerald-300 text-sm">
                En attente
              </span>
            </p>
          </div>
        </motion.div>


        {/* --------------------------- */}
        {/* 4. HISTORIQUE DES INTERACTIONS */}
        {/* --------------------------- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-2 bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-700"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="text-yellow-400" /> Historique des interactions
          </h2>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 bg-slate-700/50 rounded-xl border border-slate-600 hover:border-yellow-400 transition-all"
              >
                <p className="text-yellow-300 font-semibold">Interaction #{i}</p>
                <p className="text-slate-300 text-sm">Discussion téléphonique avec le recruteur.</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CandidaturePage;
