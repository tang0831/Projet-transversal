      {/* Modal Affichage Mariage (Premium) */}
      {showMariageModal && selectedMariage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 tracking-tight uppercase">Acte de Mariage N°{selectedMariage.numero_acte}</h3>
              <div className="flex gap-2">
                <a 
                  href={`http://localhost:8000/api/actes/mariage/${user?.numero_cin}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-900 text-white rounded-xl hover:bg-black transition"
                >
                  <Download size={20} />
                </a>
                <button onClick={() => setShowMariageModal(false)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-rouge transition"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-12 bg-[#FCFCFA]">
              <div className="relative text-center space-y-6">
                <img src="/Seal_of_Madagascar.svg.png" className="w-24 h-24 mx-auto" alt="Sceau" />
                <div className="border-y border-dashed border-gray-200 py-8 space-y-4 text-left">
                  <p className="font-bold text-center">Mariage célébré le {selectedMariage.date_mariage} à {selectedMariage.lieu_mariage}.</p>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase">Époux</label>
                        <p className="text-lg font-black">{selectedMariage.epoux.nom} {selectedMariage.epoux.prenom}</p>
                        <p className="text-sm">CIN: {selectedMariage.epoux.numero_cin}</p>
                        <p className="text-sm">Profession: {selectedMariage.epoux.profession || 'N/A'}</p>
                        <p className="text-sm">Domicile: {selectedMariage.epoux.domicile || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase">Épouse</label>
                        <p className="text-lg font-black">{selectedMariage.epouse.nom} {selectedMariage.epouse.prenom}</p>
                        <p className="text-sm">CIN: {selectedMariage.epouse.numero_cin}</p>
                        <p className="text-sm">Profession: {selectedMariage.epouse.profession || 'N/A'}</p>
                        <p className="text-sm">Domicile: {selectedMariage.epouse.domicile || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 text-left">
                  <div className="bg-white/50 p-4 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-black text-vert uppercase">Parents de l'Époux</h4>
                    <p className="text-sm font-bold">Père: {selectedMariage.epoux_parents.pere ? `${selectedMariage.epoux_parents.pere.nom} ${selectedMariage.epoux_parents.pere.prenom}` : "Non renseigné"}</p>
                    <p className="text-sm font-bold">Mère: {selectedMariage.epoux_parents.mere ? `${selectedMariage.epoux_parents.mere.nom} ${selectedMariage.epoux_parents.mere.prenom}` : "Non renseignée"}</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-black text-vert uppercase">Parents de l'Épouse</h4>
                    <p className="text-sm font-bold">Père: {selectedMariage.epouse_parents.pere ? `${selectedMariage.epouse_parents.pere.nom} ${selectedMariage.epouse_parents.pere.prenom}` : "Non renseigné"}</p>
                    <p className="text-sm font-bold">Mère: {selectedMariage.epouse_parents.mere ? `${selectedMariage.epouse_parents.mere.nom} ${selectedMariage.epouse_parents.mere.prenom}` : "Non renseignée"}</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-black text-vert uppercase">Régime Matrimonial</h4>
                    <p className="text-sm font-bold">{selectedMariage.regime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}