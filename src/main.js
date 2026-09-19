/**
 * CASAMENTO ÁDRIA & VINÍCIUS — CONVITE INTERATIVO OFICIAL
 */

document.addEventListener('DOMContentLoaded', () => {
  // Screens
  const screenEnvelope = document.getElementById('screen-envelope');
  const screenBoard = document.getElementById('screen-board');

  // Video elements
  const envelopeVideo = document.getElementById('envelope-video');
  const envelopePlayPrompt = document.getElementById('envelope-play-prompt');
  const btnTriggerPlay = document.getElementById('btn-trigger-play');
  const btnSkipVideo = document.getElementById('btn-skip-video');
  const btnReopen = document.getElementById('btn-reopen');

  // Lightbox Zoom elements
  const imageLightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const zoomHotspots = document.querySelectorAll('.zoom-hotspot');

  // Background Music
  const bgMusic = document.getElementById('bg-music');
  const btnAudioToggle = document.getElementById('btn-audio-toggle');
  const iconAudioOn = document.getElementById('icon-audio-on');
  const iconAudioOff = document.getElementById('icon-audio-off');

  let hasTransitioned = false;
  let currentImageLink = null;

  // ==========================================
  // TRANSIÇÃO PARA O SCRAPBOOK (TELA PRINCIPAL)
  // ==========================================
  function showScrapbookBoard() {
    if (hasTransitioned) return;
    hasTransitioned = true;

    screenEnvelope.classList.remove('active');
    screenEnvelope.classList.add('hidden');

    screenBoard.classList.remove('hidden');
    void screenBoard.offsetWidth; // Reflow para animação suave
    screenBoard.classList.add('active');
  }

  // ==========================================
  // REPRODUÇÃO DO VÍDEO DO ENVELOPE
  // ==========================================
  function playEnvelopeAnimation() {
    if (!envelopeVideo) return;

    // Oculta o prompt de toque inicial
    if (envelopePlayPrompt) {
      envelopePlayPrompt.classList.add('hidden');
    }

    // Exibe botão de pular caso o convidado queira ir direto
    if (btnSkipVideo) {
      btnSkipVideo.classList.remove('hidden');
    }

    // Inicia a música de fundo suavemente
    if (bgMusic) {
      bgMusic.volume = 0.5;
      bgMusic.play().catch((err) => console.warn('Autoplay audio bloqueado:', err));
    }

    envelopeVideo.currentTime = 0;
    const playPromise = envelopeVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Autoplay notice:', err);
        // Em caso de bloqueio, avança para a tela principal
        showScrapbookBoard();
      });
    }
  }

  // Ao terminar o vídeo, transiciona automaticamente para o scrapbook
  if (envelopeVideo) {
    envelopeVideo.addEventListener('ended', showScrapbookBoard);

    // Fallback de segurança para transicionar após o fim do vídeo
    envelopeVideo.addEventListener('timeupdate', () => {
      if (envelopeVideo.duration && envelopeVideo.currentTime >= envelopeVideo.duration - 0.3) {
        showScrapbookBoard();
      }
    });
  }

  if (btnTriggerPlay) {
    btnTriggerPlay.addEventListener('click', (e) => {
      e.stopPropagation();
      playEnvelopeAnimation();
    });
  }

  if (envelopePlayPrompt) {
    envelopePlayPrompt.addEventListener('click', playEnvelopeAnimation);
  }

  if (btnSkipVideo) {
    btnSkipVideo.addEventListener('click', (e) => {
      e.stopPropagation();
      if (envelopeVideo) envelopeVideo.pause();
      showScrapbookBoard();
    });
  }

  // ==========================================
  // RETORNAR AO ENVELOPE (REVER ABERTURA)
  // ==========================================
  if (btnReopen) {
    btnReopen.addEventListener('click', () => {
      closeLightbox();
      hasTransitioned = false;

      screenBoard.classList.remove('active');
      screenBoard.classList.add('hidden');

      if (envelopeVideo) {
        envelopeVideo.pause();
        envelopeVideo.currentTime = 0;
      }

      if (envelopePlayPrompt) {
        envelopePlayPrompt.classList.remove('hidden');
      }

      if (btnSkipVideo) {
        btnSkipVideo.classList.add('hidden');
      }

      // Reinicia a música (opcional, mas como toca em loop, mantemos)
      if (bgMusic && bgMusic.paused) {
        bgMusic.play().catch(() => {});
      }

      screenEnvelope.classList.remove('hidden');
      void screenEnvelope.offsetWidth;
      screenEnvelope.classList.add('active');
    });
  }

  // ==========================================
  // TOGGLE DE ÁUDIO (MÚSICA DE FUNDO)
  // ==========================================
  if (btnAudioToggle && bgMusic) {
    btnAudioToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (bgMusic.paused) {
        bgMusic.play();
        iconAudioOn.classList.remove('hidden');
        iconAudioOff.classList.add('hidden');
      } else {
        bgMusic.pause();
        iconAudioOn.classList.add('hidden');
        iconAudioOff.classList.remove('hidden');
      }
    });
  }

  // ==========================================
  // LIGHTBOX: AMPLIAÇÃO E REDIRECIONAMENTO
  // ==========================================
  function openZoom(imageSrc, altText = '', linkUrl = null) {
    if (!imageSrc) return;
    lightboxImg.src = imageSrc;
    lightboxImg.alt = altText || 'Imagem do convite ampliada';
    currentImageLink = linkUrl;

    imageLightbox.classList.remove('hidden');
    void imageLightbox.offsetWidth;
    imageLightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    imageLightbox.classList.remove('active');
    setTimeout(() => {
      imageLightbox.classList.add('hidden');
      lightboxImg.src = '';
      document.body.style.overflow = '';
    }, 300);
  }

  // Cada hotspot amplia apenas a sua respectiva imagem
  zoomHotspots.forEach((spot) => {
    spot.addEventListener('click', (e) => {
      e.stopPropagation();
      const zoomSrc = spot.getAttribute('data-zoom');
      const label = spot.getAttribute('aria-label');
      const linkUrl = spot.getAttribute('data-link');
      openZoom(zoomSrc, label, linkUrl);
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });
  }

  // Clicar fora ou na própria imagem fecha a ampliação (ou abre o link)
  imageLightbox.addEventListener('click', (e) => {
    // Se o clique foi exatamente na imagem ampliada e ela tiver um link
    if (e.target === lightboxImg && currentImageLink) {
      window.open(currentImageLink, '_blank'); // Abre em nova aba
    } else {
      // Se clicou no fundo escuro ou numa imagem sem link
      closeLightbox();
    }
  });

  // Tecla ESC fecha a ampliação
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
});
