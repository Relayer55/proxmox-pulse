import { useState, useCallback, useEffect } from 'react';
import {
  STORAGE_KEY_FILTERS,
  STORAGE_KEY_SHOW_STOPPED,
  STORAGE_KEY_SHOW_FILTERS,
  STORAGE_KEY_SEARCH_TERMS,
  STORAGE_KEY_GUEST_TYPE_FILTER
} from '../../../constants/networkConstants';

const useNetworkFilters = () => {
  // Filter states
  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILTERS);
      return saved ? JSON.parse(saved) : {
        cpu: 0,
        memory: 0,
        disk: 0,
        download: 0,
        upload: 0
      };
    } catch (e) {
      console.error('Error loading filter preferences:', e);
      return {
        cpu: 0,
        memory: 0,
        disk: 0,
        download: 0,
        upload: 0
      };
    }
  });

  // UI state
  const [showStopped, setShowStopped] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SHOW_STOPPED);
      if (saved === null) return null; // If no saved preference, show all systems
      const parsedValue = JSON.parse(saved);
      // Convert the old boolean values to the new tri-state system
      if (parsedValue === true) return true; // Show stopped systems
      if (parsedValue === false) return false; // Show running systems
      return parsedValue; // Return the value as is (should be null, true, or false)
    } catch (e) {
      console.error('Error loading show stopped preference:', e);
      return null; // Default to showing all systems
    }
  });

  const [showFilters, setShowFilters] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SHOW_FILTERS);
      return saved ? JSON.parse(saved) === true : false;
    } catch (e) {
      console.error('Error loading show filters preference:', e);
      return false;
    }
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerms, setActiveSearchTerms] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEARCH_TERMS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading active search terms:', e);
      return [];
    }
  });

  // Add guest type filter state - load from localStorage or use default
  const [guestTypeFilter, setGuestTypeFilter] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GUEST_TYPE_FILTER);
      return saved ? JSON.parse(saved) : 'all'; // Default: 'all' (show both VMs and LXCs)
    } catch (e) {
      console.error('Error loading guest type filter preference:', e);
      return 'all'; // Default to showing all guest types
    }
  });

  // State for tracking which slider is being dragged
  const [sliderDragging, setSliderDragging] = useState(null);

  // Save guest type filter preference whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GUEST_TYPE_FILTER, JSON.stringify(guestTypeFilter));
    } catch (e) {
      console.error('Error saving guest type filter preference:', e);
    }
  }, [guestTypeFilter]);

  // Save show stopped preference whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHOW_STOPPED, JSON.stringify(showStopped));
  }, [showStopped]);

  // Save show filters preference whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHOW_FILTERS, JSON.stringify(showFilters));
  }, [showFilters]);

  // Save active search terms whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SEARCH_TERMS, JSON.stringify(activeSearchTerms));
  }, [activeSearchTerms]);

  // Save filter preferences whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters));
  }, [filters]);

  // Function to add a search term
  const addSearchTerm = useCallback((term) => {
    if (!activeSearchTerms.includes(term)) {
      setActiveSearchTerms(prev => [...prev, term]);
    }
  }, [activeSearchTerms]);

  // Function to remove a search term
  const removeSearchTerm = useCallback((term) => {
    setActiveSearchTerms(prev => prev.filter(t => t !== term));
  }, []);

  // Update filter value
  const updateFilter = useCallback((filterName, newValue) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: newValue
    }));
  }, []);

  // Handle slider drag start
  const handleSliderDragStart = useCallback((filterName) => {
    setSliderDragging(filterName);
  }, []);

  // Handle slider drag end
  const handleSliderDragEnd = useCallback(() => {
    setSliderDragging(null);
  }, []);

  // Clear a specific filter
  const clearFilter = useCallback((filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: 0
    }));
  }, []);

  // Function to reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      cpu: 0,
      memory: 0,
      disk: 0,
      download: 0,
      upload: 0
    });
    setActiveSearchTerms([]);
    setSearchTerm('');
    setShowStopped(null);
    setGuestTypeFilter('all');
  }, []);

  // Function to clear only search terms
  const clearSearchTerms = useCallback(() => {
    setActiveSearchTerms([]);
    setSearchTerm('');
  }, []);

  // Count active filters
  const activeFilterCount = activeSearchTerms.length + 
    (searchTerm && !activeSearchTerms.includes(searchTerm) ? 1 : 0) + 
    Object.values(filters).filter(val => val > 0).length;

  return {
    filters,
    setFilters,
    showStopped,
    setShowStopped,
    showFilters,
    setShowFilters,
    searchTerm,
    setSearchTerm,
    activeSearchTerms,
    setActiveSearchTerms,
    guestTypeFilter,
    setGuestTypeFilter,
    sliderDragging,
    addSearchTerm,
    removeSearchTerm,
    updateFilter,
    handleSliderDragStart,
    handleSliderDragEnd,
    clearFilter,
    resetFilters,
    clearSearchTerms,
    activeFilterCount
  };
};

export default useNetworkFilters; 