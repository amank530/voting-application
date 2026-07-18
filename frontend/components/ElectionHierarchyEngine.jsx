import React, { useEffect, useMemo } from 'react';
import { 
  ELECTION_HIERARCHY, 
  getNormalizedLevel, 
  getHierarchyOptions 
} from '../services/electionHierarchy';
import { 
  ChevronRight, 
  Info, 
  MapPin, 
  HelpCircle,
  Award
} from 'lucide-react';

export default function ElectionHierarchyEngine({
  level,
  formValues = {},
  onChange,
  showBreadcrumbs = true,
  className = ""
}) {
  const normLevelName = useMemo(() => getNormalizedLevel(level), [level]);
  const levelConfig = useMemo(() => ELECTION_HIERARCHY[normLevelName], [normLevelName]);

  // Retrieve dynamic options based on current form selections
  const dynamicOptions = useMemo(() => {
    return getHierarchyOptions(normLevelName, formValues);
  }, [normLevelName, formValues]);

  // Set the positions on form values if not already present, or if level config changes
  useEffect(() => {
    if (levelConfig && levelConfig.positions) {
      // If position is not set or not matching any available position, reset it
      if (!formValues.position || !levelConfig.positions.includes(formValues.position)) {
        onChange({ 
          ...formValues, 
          position: levelConfig.positions[0] 
        });
      }
    }
  }, [levelConfig, normLevelName]);

  if (!levelConfig) {
    return (
      <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl border border-red-100 flex items-center gap-2">
        <Info className="w-4 h-4" />
        <span>No election hierarchy configuration loaded for "{level}"</span>
      </div>
    );
  }

  // Handle dropdown modifications & perform cascaded resets
  const handleFilterChange = (filterName, value) => {
    const updatedValues = { ...formValues, [filterName]: value };

    // Reset dependent cascading fields to prevent stale selections
    if (filterName === 'state') {
      updatedValues.district = '';
      updatedValues.constituency = '';
      updatedValues.city = '';
      updatedValues.town = '';
      updatedValues.municipalCorporation = '';
      updatedValues.municipalCouncil = '';
      updatedValues.nagarPanchayat = '';
      updatedValues.block = '';
      updatedValues.gramPanchayat = '';
      updatedValues.wardNo = '';
    } else if (filterName === 'district') {
      updatedValues.constituency = '';
      updatedValues.city = '';
      updatedValues.town = '';
      updatedValues.municipalCorporation = '';
      updatedValues.municipalCouncil = '';
      updatedValues.nagarPanchayat = '';
      updatedValues.block = '';
      updatedValues.gramPanchayat = '';
      updatedValues.wardNo = '';
    } else if (filterName === 'block') {
      updatedValues.gramPanchayat = '';
      updatedValues.wardNo = '';
      updatedValues.constituency = '';
    } else if (filterName === 'gramPanchayat') {
      updatedValues.wardNo = '';
    } else if (filterName === 'city') {
      updatedValues.municipalCorporation = '';
      updatedValues.wardNo = '';
    } else if (filterName === 'town') {
      updatedValues.municipalCouncil = '';
      updatedValues.nagarPanchayat = '';
      updatedValues.wardNo = '';
    } else if (filterName === 'municipalCorporation' || filterName === 'municipalCouncil' || filterName === 'nagarPanchayat') {
      updatedValues.wardNo = '';
    }

    onChange(updatedValues);
  };

  // Build list of active breadcrumb items based on current selection path
  const breadcrumbItems = useMemo(() => {
    const items = [];
    items.push({ label: 'Level', val: level });
    items.push({ label: 'Govt', val: levelConfig.governmentType });

    if (formValues.state) items.push({ label: 'State', val: formValues.state });
    if (formValues.district) items.push({ label: 'District', val: formValues.district });
    
    // Add local identifiers
    if (formValues.block) items.push({ label: 'Block', val: formValues.block });
    if (formValues.gramPanchayat) items.push({ label: 'GP', val: formValues.gramPanchayat });
    if (formValues.city) items.push({ label: 'City', val: formValues.city });
    if (formValues.town) items.push({ label: 'Town', val: formValues.town });
    
    // Add main seat / constituency
    if (formValues.constituency) {
      items.push({ label: 'Seat', val: formValues.constituency });
    } else if (formValues.municipalCorporation) {
      items.push({ label: 'Corp', val: formValues.municipalCorporation });
    } else if (formValues.municipalCouncil) {
      items.push({ label: 'Council', val: formValues.municipalCouncil });
    } else if (formValues.nagarPanchayat) {
      items.push({ label: 'Nagar', val: formValues.nagarPanchayat });
    }

    if (formValues.wardNo && (normLevelName !== 'Gram Panchayat' || formValues.position === 'Panch (Ward Member)')) {
      items.push({ label: 'Ward', val: formValues.wardNo });
    }

    if (formValues.position) {
      items.push({ label: 'Post', val: formValues.position });
    }

    return items;
  }, [level, levelConfig, formValues, normLevelName]);

  return (
    <div className={`space-y-4 ${className}`} id="election-hierarchy-engine">
      {/* 1. Progress Breadcrumbs */}
      {showBreadcrumbs && (
        <div className="bg-gray-50/60 p-3 rounded-xl border border-gray-150/80">
          <div className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5 select-none">
            <MapPin className="w-3 h-3 text-saffron-500" />
            Electoral Hierarchy Path Progress
          </div>
          <div className="flex flex-wrap items-center gap-1 text-[10px] text-gray-600 font-mono">
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                <div className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-md shadow-3xs">
                  <span className="text-gray-400 font-bold font-sans text-[9px]">{item.label}:</span>
                  <span className="font-extrabold text-primary-950 max-w-[140px] truncate" title={item.val}>{item.val}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* 2. Cascading Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
        {levelConfig.filters.map((filter) => {
          // Check conditional display (e.g. wardNo based on selected position)
          if (filter.condition && !filter.condition(formValues)) {
            return null;
          }

          // Fetch options list
          let optionsList = [];
          if (filter.name === 'state') optionsList = dynamicOptions.states;
          else if (filter.name === 'district') optionsList = dynamicOptions.districts;
          else if (filter.name === 'constituency') optionsList = dynamicOptions.constituencies;
          else if (filter.name === 'city') optionsList = dynamicOptions.cities;
          else if (filter.name === 'town') optionsList = dynamicOptions.towns;
          else if (filter.name === 'municipalCorporation') optionsList = dynamicOptions.municipalCorporations;
          else if (filter.name === 'municipalCouncil') optionsList = dynamicOptions.municipalCouncils;
          else if (filter.name === 'nagarPanchayat') optionsList = dynamicOptions.nagarPanchayats;
          else if (filter.name === 'block') optionsList = dynamicOptions.blocks;
          else if (filter.name === 'gramPanchayat') optionsList = dynamicOptions.gramPanchayats;
          else if (filter.name === 'wardNo') optionsList = dynamicOptions.wardNos;

          // Determine disabled state based on dependent parents
          const isParentEmpty = filter.dependentOn && !formValues[filter.dependentOn];

          return (
            <div key={filter.name} className="space-y-1.5 transition-all">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <span>{filter.label}</span>
                {isParentEmpty && <span className="text-[9px] text-amber-500 font-medium">(awaiting {filter.dependentOn})</span>}
                <span className="text-red-500 font-bold">*</span>
              </label>

              <select
                required
                disabled={isParentEmpty}
                value={formValues[filter.name] || ''}
                onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                className="w-full bg-gray-50/70 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:bg-white focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-gray-800"
              >
                <option value="">{filter.placeholder}</option>
                {optionsList.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          );
        })}

        {/* 3. Dynamic Positions Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Target Official Position</span>
            <span className="text-red-500 font-bold">*</span>
          </label>
          <select
            required
            value={formValues.position || ''}
            onChange={(e) => {
              const prevPos = formValues.position;
              const newPos = e.target.value;
              
              // Handle custom cascading changes, e.g. resetting wardNo if changing Panch to Sarpanch
              const nextForm = { ...formValues, position: newPos };
              if (normLevelName === 'Gram Panchayat' && newPos === 'Sarpanch') {
                nextForm.wardNo = '';
              }
              onChange(nextForm);
            }}
            className="w-full bg-emerald-50/20 border border-emerald-200 rounded-lg py-2 px-3 text-xs focus:bg-white focus:outline-none transition-all font-black text-emerald-950"
          >
            {levelConfig.positions.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>

        {/* 4. Display Government Type Compliance Badge */}
        <div className="md:col-span-2 lg:col-span-3 bg-indigo-50/30 p-2.5 rounded-xl border border-indigo-100/50 flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0"></div>
          <span className="text-[10px] text-indigo-900 font-bold">
            Federal Structure Compliance: <strong className="text-emerald-800 uppercase font-extrabold">{levelConfig.governmentType}</strong> Level Franchise mapped dynamically.
          </span>
        </div>
      </div>
    </div>
  );
}
