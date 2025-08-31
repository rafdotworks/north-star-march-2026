import { useState, useEffect } from "react";

interface ModalState {
  isNotesModalOpen: boolean;
  isAllNotesModalOpen: boolean;
  isAllExperienceModalOpen: boolean;
  isVideoModalOpen: boolean;
  isPhotosModalOpen: boolean;
  currentNoteIndex: number;
  currentPhotoIndex: number;
  currentVideoUrl: string | null;
}

interface ClickPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function useModalState() {
  const [modalState, setModalState] = useState<ModalState>({
    isNotesModalOpen: false,
    isAllNotesModalOpen: false,
    isAllExperienceModalOpen: false,
    isVideoModalOpen: false,
    isPhotosModalOpen: false,
    currentNoteIndex: 0,
    currentPhotoIndex: 0,
    currentVideoUrl: null,
  });

  const [clickedNotePosition, setClickedNotePosition] = useState<ClickPosition>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  // Note modal functions
  const openNoteModal = (index: number, e?: React.MouseEvent) => {
    if (e) {
      const element = e.currentTarget as HTMLElement;
      const rect = element.getBoundingClientRect();

      setClickedNotePosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }

    setModalState(prev => ({
      ...prev,
      currentNoteIndex: index,
      isNotesModalOpen: true,
    }));

    document.body.style.overflow = "hidden";
  };

  const closeNoteModal = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    document.body.style.overflow = "";

    setTimeout(() => {
      setModalState(prev => ({
        ...prev,
        isNotesModalOpen: false,
      }));
    }, 100);
  };

  const nextNote = (totalNotes: number) => {
    setModalState(prev => ({
      ...prev,
      currentNoteIndex: (prev.currentNoteIndex + 1) % totalNotes,
    }));
  };

  const prevNote = (totalNotes: number) => {
    setModalState(prev => ({
      ...prev,
      currentNoteIndex: (prev.currentNoteIndex - 1 + totalNotes) % totalNotes,
    }));
  };

  // All notes modal
  const openAllNotesModal = () => {
    setModalState(prev => ({
      ...prev,
      isAllNotesModalOpen: true,
    }));
    document.body.style.overflow = "hidden";
  };

  const closeAllNotesModal = () => {
    document.body.style.overflow = "";
    setModalState(prev => ({
      ...prev,
      isAllNotesModalOpen: false,
    }));
  };

  // All experience modal
  const openAllExperienceModal = () => {
    setModalState(prev => ({
      ...prev,
      isAllExperienceModalOpen: true,
    }));
    document.body.style.overflow = "hidden";
  };

  const closeAllExperienceModal = () => {
    document.body.style.overflow = "";
    setModalState(prev => ({
      ...prev,
      isAllExperienceModalOpen: false,
    }));
  };

  // Video modal functions
  const openVideoModal = (videoUrl: string) => {
    setModalState(prev => ({
      ...prev,
      currentVideoUrl: videoUrl,
      isVideoModalOpen: true,
    }));
  };

  const closeVideoModal = () => {
    setModalState(prev => ({
      ...prev,
      isVideoModalOpen: false,
      currentVideoUrl: null,
    }));
  };

  // Photo modal functions
  const openPhotoModal = (index: number = 0) => {
    setModalState(prev => ({
      ...prev,
      currentPhotoIndex: index,
      isPhotosModalOpen: true,
    }));
    document.body.style.overflow = "hidden";
  };

  const closePhotoModal = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    document.body.style.overflow = "";

    setTimeout(() => {
      setModalState(prev => ({
        ...prev,
        isPhotosModalOpen: false,
      }));
    }, 100);
  };

  const nextPhoto = (totalPhotos: number) => {
    setModalState(prev => ({
      ...prev,
      currentPhotoIndex: (prev.currentPhotoIndex + 1) % totalPhotos,
    }));
  };

  const prevPhoto = (totalPhotos: number) => {
    setModalState(prev => ({
      ...prev,
      currentPhotoIndex: (prev.currentPhotoIndex - 1 + totalPhotos) % totalPhotos,
    }));
  };

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent, totalNotes: number, totalPhotos: number) => {
    if (e.key === "Escape") {
      if (modalState.isNotesModalOpen || modalState.isAllNotesModalOpen || modalState.isVideoModalOpen) {
        closeNoteModal();
        closeAllNotesModal();
        closeVideoModal();
      }
      if (modalState.isPhotosModalOpen) {
        closePhotoModal();
      }
      return;
    }

    const anyModalOpen = modalState.isNotesModalOpen || 
                        modalState.isAllNotesModalOpen || 
                        modalState.isVideoModalOpen ||
                        modalState.isPhotosModalOpen;

    if (anyModalOpen && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      if (modalState.isNotesModalOpen) {
        if (e.key === "ArrowRight") {
          nextNote(totalNotes);
        } else {
          prevNote(totalNotes);
        }
      }
      if (modalState.isPhotosModalOpen) {
        if (e.key === "ArrowRight") {
          nextPhoto(totalPhotos);
        } else {
          prevPhoto(totalPhotos);
        }
      }
    }
  };

  // Cleanup effect for modal state
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Check if any modal is open
  const isAnyModalOpen = modalState.isNotesModalOpen || 
                        modalState.isAllNotesModalOpen || 
                        modalState.isAllExperienceModalOpen ||
                        modalState.isVideoModalOpen ||
                        modalState.isPhotosModalOpen;

  return {
    modalState,
    clickedNotePosition,
    isAnyModalOpen,
    
    // Note modal
    openNoteModal,
    closeNoteModal,
    nextNote,
    prevNote,
    
    // All notes modal
    openAllNotesModal,
    closeAllNotesModal,
    
    // All experience modal
    openAllExperienceModal,
    closeAllExperienceModal,
    
    // Video modal
    openVideoModal,
    closeVideoModal,
    
    // Photo modal
    openPhotoModal,
    closePhotoModal,
    nextPhoto,
    prevPhoto,
    
    // Keyboard navigation
    handleKeyDown,
  };
}