import React, { useState } from 'react';
import { ClipboardList, AlertTriangle, LogIn, PlusCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface InspectionArea {
  name: string;
  hasIssue: boolean;
}

interface Equipment {
  id: string;
  name: string;
  models: string[];
}

interface CompanyInspection {
  company: string;
  startTime: string;
}

interface Inspection {
  id: string;
  timestamp: string;
  company: string;
  equipment: string;
  model: string;
  status: string;
  defectType?: string;
  analyst: string;
  analystCode: string;
  inspectionAreas: InspectionArea[];
  companyInspectionTime: string;
}

function Login({ onLogin }: { onLogin: (analyst: string, code: string) => void }) {
  const [analyst, setAnalyst] = useState('');
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(analyst, code);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full p-6">
        <div className="flex flex-col items-center gap-3 mb-8">
          <LogIn className="w-12 h-12 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Login do Analista</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Analista
              </label>
              <input
                type="text"
                value={analyst}
                onChange={(e) => setAnalyst(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código
              </label>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InspectionForm({ 
  onSubmit, 
  onCancel,
  analyst,
  analystCode,
  companyInspections
}: { 
  onSubmit: (inspection: Omit<Inspection, 'id'>) => void;
  onCancel: () => void;
  analyst: string;
  analystCode: string;
  companyInspections: CompanyInspection[];
}) {
  const [company, setCompany] = useState(['', '', '']);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [status, setStatus] = useState('');
  const [defectType, setDefectType] = useState('');
  const [inspectionAreas, setInspectionAreas] = useState<InspectionArea[]>([
    { name: 'Tela', hasIssue: false },
    { name: 'Fio', hasIssue: false },
    { name: 'Corpo', hasIssue: false },
    { name: 'Energia', hasIssue: false },
    { name: 'Leitor', hasIssue: false },
  ]);

  const equipments: Equipment[] = [
    { 
      id: '1', 
      name: 'Pistola Leitora', 
      models: ['MC-330K', 'LI4278', 'DS2208'] 
    },
    { 
      id: '2', 
      name: 'Impressora Térmica', 
      models: ['ZT411', 'ZD420', 'GC420t'] 
    }
  ];

  const handleCompanyChange = (index: number, value: string) => {
    const newCompany = [...company];
    newCompany[index] = value.slice(0, 3);
    setCompany(newCompany);
  };

  const handleAreaToggle = (index: number) => {
    const newAreas = [...inspectionAreas];
    newAreas[index].hasIssue = !newAreas[index].hasIssue;
    setInspectionAreas(newAreas);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedEquipmentData = equipments.find(eq => eq.id === selectedEquipment);
    const companyCode = company.join('-');
    
    // Get company inspection time or create new one
    const existingInspection = companyInspections.find(ci => ci.company === companyCode);
    const companyInspectionTime = existingInspection 
      ? existingInspection.startTime 
      : new Date().toISOString();
    
    onSubmit({
      timestamp: new Date().toISOString(),
      company: companyCode,
      equipment: selectedEquipmentData?.name || '',
      model: selectedModel,
      status,
      defectType: status === 'defeito' ? defectType : undefined,
      analyst,
      analystCode,
      inspectionAreas,
      companyInspectionTime
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código da Empresa
          </label>
          <div className="flex gap-2">
            {company.map((value, index) => (
              <input
                key={index}
                type="text"
                maxLength={3}
                value={value}
                onChange={(e) => handleCompanyChange(index, e.target.value)}
                className="w-20 p-2 border rounded-md"
                placeholder="000"
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Equipamento
          </label>
          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Selecione o equipamento</option>
            {equipments.map((eq) => (
              <option key={eq.id} value={eq.id}>{eq.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modelo
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
            disabled={!selectedEquipment}
          >
            <option value="">Selecione o modelo</option>
            {equipments
              .find(eq => eq.id === selectedEquipment)
              ?.models.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status do Equipamento
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Selecione o status</option>
            <option value="em_uso">Em Uso</option>
            <option value="nao_em_uso">Não em Uso</option>
            <option value="defeito">Defeito</option>
          </select>
        </div>

        {status === 'defeito' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Defeito
            </label>
            <select
              value={defectType}
              onChange={(e) => setDefectType(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Selecione a gravidade</option>
              <option value="leve">Leve</option>
              <option value="medio">Médio</option>
              <option value="grave">Grave</option>
            </select>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Áreas com Problema</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {inspectionAreas.map((area, index) => (
            <button
              key={area.name}
              type="button"
              onClick={() => handleAreaToggle(index)}
              className={`p-4 rounded-lg border ${
                area.hasIssue 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              } flex items-center gap-2 hover:bg-gray-100 transition-colors`}
            >
              {area.hasIssue && <AlertTriangle className="w-4 h-4" />}
              {area.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Registrar Vistoria
        </button>
      </div>
    </form>
  );
}

function Dashboard({ 
  inspections, 
  onNewInspection,
  analyst,
  analystCode 
}: { 
  inspections: Inspection[];
  onNewInspection: () => void;
  analyst: string;
  analystCode: string;
}) {
  const handleExportToExcel = () => {
    // Prepare data for export
    const exportData = inspections.map(inspection => ({
      'Data/Hora da Vistoria': new Date(inspection.timestamp).toLocaleString('pt-BR'),
      'Hora Início da Empresa': new Date(inspection.companyInspectionTime).toLocaleString('pt-BR'),
      'Empresa': inspection.company,
      'Equipamento': inspection.equipment,
      'Modelo': inspection.model,
      'Status': inspection.status === 'em_uso' 
        ? 'Em Uso' 
        : inspection.status === 'nao_em_uso'
        ? 'Não em Uso'
        : `Defeito ${inspection.defectType}`,
      'Analista': inspection.analyst,
      'Áreas com Problema': inspection.inspectionAreas
        .filter(area => area.hasIssue)
        .map(area => area.name)
        .join(', ')
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vistorias');

    // Generate Excel file
    XLSX.writeFile(wb, 'vistorias.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Sistema de Vistoria de Equipamentos</h1>
          </div>
          <div className="text-sm text-gray-600">
            Analista: {analyst}
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={onNewInspection}
            className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Nova Vistoria de Equipamento
          </button>

          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Exportar para Excel
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Início Vistoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modelo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problemas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Analista
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inspections.map((inspection) => (
                <tr key={inspection.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(inspection.timestamp).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(inspection.companyInspectionTime).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inspection.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inspection.equipment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inspection.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      inspection.status === 'em_uso' 
                        ? 'bg-green-100 text-green-800'
                        : inspection.status === 'nao_em_uso'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {inspection.status === 'em_uso' 
                        ? 'Em Uso' 
                        : inspection.status === 'nao_em_uso'
                        ? 'Não em Uso'
                        : `Defeito ${inspection.defectType}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inspection.inspectionAreas
                      .filter(area => area.hasIssue)
                      .map(area => area.name)
                      .join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inspection.analyst}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [analyst, setAnalyst] = useState('');
  const [analystCode, setAnalystCode] = useState('');
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [companyInspections, setCompanyInspections] = useState<CompanyInspection[]>([]);

  const handleLogin = (analystName: string, code: string) => {
    setAnalyst(analystName);
    setAnalystCode(code);
    setIsLoggedIn(true);
  };

  const handleNewInspection = () => {
    setShowInspectionForm(true);
  };

  const handleInspectionSubmit = (inspection: Omit<Inspection, 'id'>) => {
    const newInspection: Inspection = {
      ...inspection,
      id: Math.random().toString(36).substr(2, 9)
    };

    // Update company inspections if this is the first inspection for this company
    if (!companyInspections.find(ci => ci.company === inspection.company)) {
      setCompanyInspections([
        ...companyInspections,
        { company: inspection.company, startTime: inspection.companyInspectionTime }
      ]);
    }

    setInspections([newInspection, ...inspections]);
    setShowInspectionForm(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  if (showInspectionForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Nova Vistoria de Equipamento</h1>
            </div>
          </div>
          <InspectionForm 
            onSubmit={handleInspectionSubmit}
            onCancel={() => setShowInspectionForm(false)}
            analyst={analyst}
            analystCode={analystCode}
            companyInspections={companyInspections}
          />
        </div>
      </div>
    );
  }

  return (
    <Dashboard 
      inspections={inspections}
      onNewInspection={handleNewInspection}
      analyst={analyst}
      analystCode={analystCode}
    />
  );
}

export default App;