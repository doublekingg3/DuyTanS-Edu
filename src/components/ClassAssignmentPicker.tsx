import React, { useState, useMemo } from 'react';
import { SchoolClass, Student, sortClasses } from '../data';
import { Search, Check, X, Users, Building2, Layers, CheckSquare, Square, RefreshCcw } from 'lucide-react';

interface ClassAssignmentPickerProps {
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  classes: SchoolClass[];
  selectedClassIds: string[];
  onChange: (ids: string[]) => void;
  students?: Student[];
  accentColor?: 'teal' | 'indigo';
  disabledClassIds?: string[];
  disabledReason?: string;
  allowSelectAll?: boolean;
}

export default function ClassAssignmentPicker({
  title,
  subtitle,
  badgeLabel,
  classes,
  selectedClassIds,
  onChange,
  students = [],
  accentColor = 'indigo',
  disabledClassIds = [],
  disabledReason = 'Đã chọn ở mục khác',
  allowSelectAll = true
}: ClassAssignmentPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeGrade, setActiveGrade] = useState<string>('all');

  // Count students per class
  const studentCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    students.forEach(s => {
      if (s.classId) {
        map[s.classId] = (map[s.classId] || 0) + 1;
      }
    });
    return map;
  }, [students]);

  // Extract unique numeric grades (e.g. 10, 11, 12, 6, 7, 8, 9...)
  const grades = useMemo(() => {
    const set = new Set<string>();
    classes.forEach(c => {
      const match = c.name.trim().match(/^(\d+)/);
      if (match) {
        set.add(match[1]);
      }
    });
    return Array.from(set).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }, [classes]);

  // Filter classes based on grade and search
  const filteredClasses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const sorted = sortClasses ? sortClasses(classes) : [...classes].sort((a, b) => a.name.localeCompare(b.name));
    
    return sorted.filter(c => {
      // Grade filter
      if (activeGrade !== 'all') {
        const match = c.name.trim().match(/^(\d+)/);
        if (!match || match[1] !== activeGrade) {
          return false;
        }
      }
      // Search filter
      if (term) {
        const matchesName = c.name.toLowerCase().includes(term);
        const matchesRoom = c.room ? c.room.toLowerCase().includes(term) : false;
        const matchesTeacher = c.homeroomTeacher ? c.homeroomTeacher.toLowerCase().includes(term) : false;
        const matchesSpecial = c.specialization ? c.specialization.toLowerCase().includes(term) : false;
        if (!matchesName && !matchesRoom && !matchesTeacher && !matchesSpecial) {
          return false;
        }
      }
      return true;
    });
  }, [classes, activeGrade, searchTerm]);

  // Selected classes objects
  const selectedClasses = useMemo(() => {
    return classes.filter(c => selectedClassIds.includes(c.id));
  }, [classes, selectedClassIds]);

  // Toggle single class
  const handleToggleClass = (classId: string) => {
    if (disabledClassIds.includes(classId)) return;
    if (selectedClassIds.includes(classId)) {
      onChange(selectedClassIds.filter(id => id !== classId));
    } else {
      onChange([...selectedClassIds, classId]);
    }
  };

  // Remove single class from tags
  const handleRemoveClass = (classId: string) => {
    onChange(selectedClassIds.filter(id => id !== classId));
  };

  // Select all currently filtered (non-disabled) classes
  const handleSelectAllFiltered = () => {
    const availableFilteredIds = filteredClasses
      .filter(c => !disabledClassIds.includes(c.id))
      .map(c => c.id);
    const newSelected = Array.from(new Set([...selectedClassIds, ...availableFilteredIds]));
    onChange(newSelected);
  };

  // Deselect all currently filtered classes
  const handleDeselectFiltered = () => {
    const filteredIdsSet = new Set(filteredClasses.map(c => c.id));
    const newSelected = selectedClassIds.filter(id => !filteredIdsSet.has(id));
    onChange(newSelected);
  };

  // Clear all selections
  const handleClearAll = () => {
    onChange([]);
  };

  const isTeal = accentColor === 'teal';
  const activeBorderClass = isTeal ? 'border-teal-600' : 'border-indigo-600';
  const activeBgClass = isTeal ? 'bg-teal-50/90' : 'bg-indigo-50/90';
  const activeTextClass = isTeal ? 'text-teal-950' : 'text-indigo-950';
  const ringClass = isTeal ? 'ring-2 ring-teal-500/20' : 'ring-2 ring-indigo-500/20';
  const badgeBgClass = isTeal ? 'bg-teal-100 text-teal-800 border-teal-200' : 'bg-indigo-100 text-indigo-800 border-indigo-200';
  const buttonPrimaryClass = isTeal 
    ? 'text-teal-700 bg-teal-50 hover:bg-teal-100 border-teal-200' 
    : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200';

  return (
    <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h5 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
              {isTeal ? (
                <Building2 className="w-4 h-4 text-teal-700 shrink-0" />
              ) : (
                <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
              )}
              <span>{title}</span>
            </h5>
            {badgeLabel && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeBgClass}`}>
                {badgeLabel}
              </span>
            )}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
              Đã chọn: <strong className={isTeal ? 'text-teal-700' : 'text-indigo-600'}>{selectedClassIds.length}</strong>/{classes.length} lớp
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {allowSelectAll && filteredClasses.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 shadow-2xs ${buttonPrimaryClass}`}
              title="Chọn tất cả các lớp đang hiển thị theo bộ lọc"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Chọn tất cả ({filteredClasses.filter(c => !disabledClassIds.includes(c.id)).length})</span>
            </button>
          )}
          {selectedClassIds.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors shadow-2xs"
              title="Bỏ chọn toàn bộ"
            >
              Bỏ chọn tất cả
            </button>
          )}
        </div>
      </div>

      {/* Selected Classes Preview Tags (Chips) */}
      {selectedClasses.length > 0 && (
        <div className="bg-white/95 rounded-xl p-2.5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Danh sách lớp đã chọn ({selectedClasses.length}):
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-red-600 hover:text-red-700 font-medium"
            >
              Xóa tất cả
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {selectedClasses.map(c => (
              <span
                key={c.id}
                className={`inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-lg text-xs font-bold border transition-all ${
                  isTeal
                    ? 'bg-teal-50 border-teal-300 text-teal-900'
                    : 'bg-indigo-50 border-indigo-300 text-indigo-900'
                }`}
              >
                <span>{c.name}</span>
                <span className="text-[10px] opacity-75 font-normal">
                  ({studentCountMap[c.id] || 0} HS)
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveClass(c.id);
                  }}
                  className="p-0.5 rounded hover:bg-black/10 transition-colors ml-0.5"
                  title={`Bỏ chọn lớp ${c.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search & Grade Filter Bar */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm nhanh lớp (VD: 10A1, 11B, phòng học...)"
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Grade filter tabs if available */}
          {grades.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0 shrink-0">
              <button
                type="button"
                onClick={() => setActiveGrade('all')}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all shrink-0 ${
                  activeGrade === 'all'
                    ? (isTeal ? 'bg-teal-700 text-white border-teal-700 shadow-xs' : 'bg-indigo-600 text-white border-indigo-600 shadow-xs')
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Tất cả
              </button>
              {grades.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setActiveGrade(g)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all shrink-0 ${
                    activeGrade === g
                      ? (isTeal ? 'bg-teal-700 text-white border-teal-700 shadow-xs' : 'bg-indigo-600 text-white border-indigo-600 shadow-xs')
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Khối {g}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Classes Grid - Modern Cards */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-2 sm:p-2.5 max-h-60 sm:max-h-72 overflow-y-auto shadow-inner">
        {filteredClasses.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-1.5" />
            <p className="text-xs font-medium">Không tìm thấy lớp học nào phù hợp</p>
            {(searchTerm || activeGrade !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setActiveGrade('all');
                }}
                className="text-xs text-indigo-600 hover:underline mt-1 inline-flex items-center gap-1"
              >
                <RefreshCcw className="w-3 h-3" />
                <span>Đặt lại bộ lọc</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filteredClasses.map(c => {
              const isSelected = selectedClassIds.includes(c.id);
              const isDisabled = disabledClassIds.includes(c.id);
              const studentCount = studentCountMap[c.id] || 0;

              return (
                <div
                  key={c.id}
                  onClick={() => !isDisabled && handleToggleClass(c.id)}
                  className={`relative p-2.5 rounded-xl border transition-all select-none text-left ${
                    isDisabled
                      ? 'bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? `${activeBgClass} ${activeBorderClass} ${ringClass} cursor-pointer shadow-xs`
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 cursor-pointer shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className={`text-sm font-bold truncate ${isSelected ? activeTextClass : 'text-slate-800'}`}>
                      {c.name}
                    </span>
                    <div className="shrink-0 pt-0.5">
                      {isDisabled ? (
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-1 rounded font-medium">
                          Khóa
                        </span>
                      ) : isSelected ? (
                        <span className={`w-4 h-4 rounded-md flex items-center justify-center text-white ${isTeal ? 'bg-teal-700' : 'bg-indigo-600'}`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      ) : (
                        <div className="w-4 h-4 rounded-md border border-slate-300 bg-white" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-0.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-0.5">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{studentCount} HS</span>
                      </span>
                      {c.room && (
                        <span className="truncate max-w-[70px] text-slate-400" title={`Phòng ${c.room}`}>
                          P.{c.room}
                        </span>
                      )}
                    </div>

                    {isDisabled ? (
                      <p className="text-[10px] text-amber-700 font-medium truncate pt-0.5" title={disabledReason}>
                        {disabledReason}
                      </p>
                    ) : c.homeroomTeacher ? (
                      <p className="text-[10px] text-slate-500 truncate pt-0.5" title={`GVCN: ${c.homeroomTeacher}`}>
                        GVCN: <span className="text-slate-700 font-medium">{c.homeroomTeacher}</span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic pt-0.5">
                        Chưa có GVCN
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>Nhấp vào thẻ lớp để chọn / bỏ chọn</span>
        <span>Tổng cộng: {filteredClasses.length} lớp hiển thị</span>
      </div>
    </div>
  );
}
