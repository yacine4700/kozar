import { useState, useMemo } from 'react';
import { CustomerInfo, ModelOrder, AgeSize, ColorOrder, Product } from '@/types';
import { submitWholesaleOrder } from '@/actions/orders/submit-order';

export type ViewState = 'form' | 'success';

export function useOrderSystem(products: Product[] = []) {
  const [view, setView] = useState<ViewState>('form');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [customer, setCustomer] = useState<CustomerInfo>({
    merchantName: '',
    whatsapp: '',
    state: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [modelStates, setModelStates] = useState<Record<string, ModelOrder>>(() => {
    const initial: Record<string, ModelOrder> = {};
    products.forEach(product => {
      initial[product.id] = {
        productId: product.id,
        modelName: product.name,
        selected: false,
        colorOrders: {}
      };
    });
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return products
      .filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.sku && p.sku.toLowerCase().includes(query))
      );
  }, [searchQuery, products]);

  const filteredModels = useMemo(() => {
    if (!activeFilter.trim()) return products.map(p => p.id);
    const query = activeFilter.toLowerCase();
    return products
      .filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.sku && p.sku.toLowerCase().includes(query))
      )
      .map(p => p.id);
  }, [activeFilter, products]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setActiveFilter(searchQuery);
    setIsSearchFocused(false);
  };

  const handleSuggestionClick = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setSearchQuery(product.name);
      setActiveFilter(product.name);
      setIsSearchFocused(false);
    }
  };

  const clearFilter = () => {
    setSearchQuery('');
    setActiveFilter('');
  };

  const toggleModelSelection = (id: string) => {
    setModelStates(prev => {
      const isNowSelected = !prev[id]?.selected;
      const product = products.find(p => p.id === id);
      
      if (!product) return prev;

      let newColorOrders = { ...(prev[id]?.colorOrders || {}) };
      
      const hasColors = product.colors && product.colors.length > 0;
      
      if (isNowSelected && !hasColors && Object.keys(newColorOrders).length === 0) {
        newColorOrders['no-color'] = {
          singleQuantity: '',
          quantities: (product.sizes || []).reduce((acc, age) => ({ ...acc, [age]: '' }), {} as Record<AgeSize, number | string>)
        };
      }
      
      return {
        ...prev,
        [id]: { 
          ...prev[id], 
          selected: isNowSelected, 
          colorOrders: newColorOrders,
          productId: id,
          modelName: product.name 
        }
      };
    });
  };

  const updateModelData = (id: string, updates: Partial<ModelOrder>) => {
    setModelStates(prev => {
      const existing = prev[id];
      if (existing) {
        return { ...prev, [id]: { ...existing, ...updates } };
      }
      
      const product = products.find(p => p.id === id);
      if (!product) return prev;
      
      return {
        ...prev,
        [id]: {
          productId: id,
          modelName: product.name,
          selected: false,
          colorOrders: {},
          ...updates
        }
      };
    });
  };

  const selectedModels = useMemo(() => {
    return (Object.values(modelStates) as ModelOrder[]).filter(m => m.selected);
  }, [modelStates]);

  const totalPieces = useMemo(() => {
    return selectedModels.reduce((acc: number, model) => {
      const product = products.find(p => p.id === model.productId);
      if (!product) return acc;

      const hasSizes = product.sizes && product.sizes.length > 0;

      const modelTotal = (Object.values(model.colorOrders) as ColorOrder[]).reduce((cAcc: number, order: ColorOrder) => {
        if (hasSizes) {
          const colorTotal = product.sizes.reduce((sAcc: number, age) => sAcc + (Number(order.quantities[age]) || 0), 0);
          return cAcc + colorTotal;
        } else {
          return cAcc + (Number(order.singleQuantity) || 0);
        }
      }, 0);
      return acc + modelTotal;
    }, 0);
  }, [selectedModels, products]);

  const handleOpenReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.merchantName || !customer.whatsapp || !customer.state) {
      alert('يرجى ملء جميع بيانات التاجر الأساسية');
      return;
    }

    if (selectedModels.length === 0) {
      alert('يرجى اختيار منتج واحد على الأقل من القائمة');
      return;
    }

    if (totalPieces === 0) {
      alert('يرجى اختيار ألوان وإدخال الكميات المطلوبة للمنتجات المختارة');
      return;
    }

    setShowReviewModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseReview = () => {
    setShowReviewModal(false);
    document.body.style.overflow = 'auto';
  };

  const handleFinalConfirm = async () => {
    setIsSubmitting(true);
    
    const result = await submitWholesaleOrder(customer, selectedModels);
    
    setIsSubmitting(false);

    if (result.error) {
      alert(result.error);
      return;
    }

    setShowReviewModal(false);
    document.body.style.overflow = 'auto';
    setView('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    view,
    setView,
    showReviewModal,
    customer,
    setCustomer,
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    suggestions,
    filteredModels,
    handleSearchSubmit,
    handleSuggestionClick,
    clearFilter,
    toggleModelSelection,
    updateModelData,
    selectedModels,
    modelStates,
    totalPieces,
    handleOpenReview,
    handleCloseReview,
    handleFinalConfirm,
    isSubmitting
  };
}
