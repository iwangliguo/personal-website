import { useState, useMemo } from 'react';
import type { DiaryEntry } from '../data/diaries';

interface UseDateFilterOptions {
  items: DiaryEntry[];
}

/**
 * 日记日期筛选 hook
 * @param items  全量日记数据
 */
export function useDateFilter({ items }: UseDateFilterOptions) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = useMemo(() => {
    if (!startDate && !endDate) return items;
    
    return items.filter(item => {
      // 从 ISO 格式提取日期部分进行比较
      const itemDate = item.date.split('T')[0]; // 格式: "2023-08-03"
      
      if (startDate && endDate) {
        return itemDate >= startDate && itemDate <= endDate;
      }
      if (startDate) {
        return itemDate >= startDate;
      }
      if (endDate) {
        return itemDate <= endDate;
      }
      return true;
    });
  }, [items, startDate, endDate]);

  const clearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  const hasDateFilter = Boolean(startDate || endDate);

  return { startDate, setStartDate, endDate, setEndDate, filtered, clearDates, hasDateFilter };
}
