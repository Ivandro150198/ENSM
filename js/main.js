/* =========================================================
   Escola Nacional de Surdos e Mudos da Guiné-Bissau
   Comportamentos do site: menu, ano e formulário de contacto
   ========================================================= */
(function () {
  'use strict';

  /* Indica que o JavaScript está ativo (usado pelas animações de entrada) */
  document.documentElement.classList.add('js');

  /* Ano atual no rodapé */
  var ano = document.getElementById('ano');
  if (ano) {
    ano.textContent = new Date().getFullYear();
  }

  /* Sprite de ícones: carrega uma vez e liga as referências locais (#ico-…) */
  var ligarIcones = function () {
    document.querySelectorAll('svg.ico use').forEach(function (use) {
      var href = use.getAttribute('href') || use.getAttribute('xlink:href') || '';
      var hash = href.indexOf('#') >= 0 ? href.slice(href.indexOf('#')) : '';
      if (hash) {
        use.setAttribute('href', hash);
      }
    });
  };

  fetch('img/icons.svg')
    .then(function (resposta) { return resposta.text(); })
    .then(function (svg) {
      var caixa = document.createElement('div');
      caixa.id = 'sprite-icones';
      caixa.setAttribute('aria-hidden', 'true');
      caixa.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      caixa.innerHTML = svg;
      document.body.insertBefore(caixa, document.body.firstChild);
      ligarIcones();
    })
    .catch(function () {
      /* Mantém as referências externas img/icons.svg#… */
    });

  /* Reforço visual: gesto ao passar o rato / foco */
  document.querySelectorAll('.main-nav a, .footer-nav a, .footer-gesto-item, .brand-gesto').forEach(function (el) {
    el.addEventListener('pointerenter', function () {
      el.classList.add('is-gesto');
    });
    el.addEventListener('pointerleave', function () {
      el.classList.remove('is-gesto');
    });
  });

  /* Menu em telemóvel */
  var botao = document.querySelector('.nav-toggle');
  var menu = document.getElementById('menu');

  if (botao && menu) {
    var fechar = function () {
      menu.classList.remove('open');
      botao.setAttribute('aria-expanded', 'false');
    };

    botao.addEventListener('click', function () {
      var aberto = menu.classList.toggle('open');
      botao.setAttribute('aria-expanded', String(aberto));
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', fechar);
    });

    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && menu.classList.contains('open')) {
        fechar();
        botao.focus();
      }
    });
  }

  /* Formulário de contacto: prepara a mensagem. Se data-destino tiver email,
     abre o cliente de email; caso contrário, mostra o texto para copiar/entregar. */
  var formulario = document.getElementById('form-contacto');

  if (formulario) {
    var estado = document.getElementById('estado-form');

    formulario.addEventListener('submit', function (evento) {
      evento.preventDefault();

      var primeiroInvalido = null;
      var campos = formulario.querySelectorAll('[required]');

      campos.forEach(function (campo) {
        var valido = campo.value.trim() !== '' && campo.checkValidity();
        campo.setAttribute('aria-invalid', String(!valido));
        if (!valido && !primeiroInvalido) {
          primeiroInvalido = campo;
        }
      });

      if (primeiroInvalido) {
        estado.textContent = 'Revise os campos assinalados.';
        primeiroInvalido.focus();
        return;
      }

      var nome = formulario.nome.value.trim();
      var email = formulario.email.value.trim();
      var telefone = formulario.telefone.value.trim() || 'Não indicado';
      var assunto = formulario.assunto.value;
      var mensagem = formulario.mensagem.value.trim();
      var destino = (formulario.getAttribute('data-destino') || '').trim();

      var corpo = 'Nome: ' + nome + '\n' +
                  'Email: ' + email + '\n' +
                  'Telefone: ' + telefone + '\n' +
                  'Assunto: ' + assunto + '\n\n' +
                  mensagem;

      if (destino) {
        window.location.href = 'mailto:' + destino +
          '?subject=' + encodeURIComponent('[Site ENSM] ' + assunto) +
          '&body=' + encodeURIComponent(corpo);
        estado.textContent = 'Se o email não abrir, copie a mensagem e entregue-a na escola em Ponta Gardete.';
      } else {
        estado.textContent = 'Mensagem preparada (copie ou entregue na escola):\n\n' + corpo;
      }
    });
  }
  /* Notícias: filtro por categoria + promoção da capa */
  var filtros = document.querySelectorAll('.filtro');
  var listaNoticias = document.querySelectorAll('#lista-noticias .noticia');
  var contador = document.getElementById('contador-noticias');
  var palco = document.getElementById('lista-noticias');
  var trilhas = palco ? palco.querySelector('.noticias-trilhas') : null;

  var aplicarModeloNoticias = function () {
    if (!palco || !trilhas) {
      return;
    }
    var visiveis = Array.prototype.filter.call(listaNoticias, function (n) {
      return !n.hidden;
    });
    visiveis.forEach(function (noticia, indice) {
      var corpo = noticia.querySelector('.noticia-capa-corpo, .noticia-trilha-corpo');
      if (indice === 0) {
        noticia.classList.add('noticia--capa');
        noticia.classList.remove('noticia--trilha');
        if (corpo) {
          corpo.className = 'noticia-capa-corpo';
        }
        if (noticia.parentElement === trilhas) {
          palco.insertBefore(noticia, trilhas);
        }
      } else {
        noticia.classList.add('noticia--trilha');
        noticia.classList.remove('noticia--capa');
        if (corpo) {
          corpo.className = 'noticia-trilha-corpo';
        }
        if (noticia.parentElement !== trilhas) {
          trilhas.appendChild(noticia);
        }
      }
    });
  };

  if (filtros.length && listaNoticias.length) {
    filtros.forEach(function (botao) {
      botao.addEventListener('click', function () {
        var escolhida = botao.getAttribute('data-filtro');
        var visiveis = 0;

        filtros.forEach(function (outro) {
          outro.setAttribute('aria-pressed', String(outro === botao));
        });

        listaNoticias.forEach(function (noticia) {
          var mostrar = escolhida === 'todas' ||
                        noticia.getAttribute('data-categoria') === escolhida;
          noticia.hidden = !mostrar;
          if (mostrar) {
            visiveis++;
          }
        });

        aplicarModeloNoticias();

        if (contador) {
          contador.textContent = 'A mostrar ' + visiveis +
                                 (visiveis === 1 ? ' notícia.' : ' notícias.');
        }
      });
    });
  }

  /* Notícias: abrir conteúdo completo no próprio site */
  var visorNoticia = document.getElementById('visor-noticia');

  if (visorNoticia && typeof visorNoticia.showModal === 'function') {
    var imgVisor = document.getElementById('visor-noticia-imagem');
    var tituloVisor = document.getElementById('visor-noticia-titulo');
    var metaVisor = document.getElementById('visor-noticia-meta');
    var corpoVisor = document.getElementById('visor-noticia-corpo');
    var fonteVisor = document.getElementById('visor-noticia-fonte');

    var abrirNoticia = function (id) {
      var artigo = document.getElementById(id);
      if (!artigo) {
        return;
      }
      var img = artigo.querySelector('.noticia-foto img');
      var titulo = artigo.querySelector('h3');
      var etiqueta = artigo.querySelector('.etiqueta');
      var data = artigo.querySelector('time');
      var completa = artigo.querySelector('.noticia-completa');
      var fonte = artigo.querySelector('.fonte');

      imgVisor.src = img ? img.src : '';
      imgVisor.alt = img ? img.alt : '';
      tituloVisor.textContent = titulo ? titulo.textContent : '';
      metaVisor.textContent = [
        etiqueta ? etiqueta.textContent : '',
        data ? data.textContent : ''
      ].filter(Boolean).join(' · ');
      corpoVisor.innerHTML = completa ? completa.innerHTML : '';
      fonteVisor.innerHTML = fonte ? fonte.innerHTML : '';
      visorNoticia.showModal();
      history.replaceState(null, '', '#' + id);
    };

    document.querySelectorAll('.noticia-abrir').forEach(function (botao) {
      botao.addEventListener('click', function () {
        abrirNoticia(botao.getAttribute('data-noticia'));
      });
    });

    var fecharNoticia = function () {
      visorNoticia.close();
      if (location.hash) {
        history.replaceState(null, '', location.pathname + location.search);
      }
    };

    visorNoticia.querySelector('[data-noticia-fechar]').addEventListener('click', fecharNoticia);
    visorNoticia.addEventListener('click', function (evento) {
      if (evento.target === visorNoticia) {
        fecharNoticia();
      }
    });

    if (location.hash && location.hash.indexOf('#noticia-') === 0) {
      abrirNoticia(location.hash.slice(1));
    }
  }

  /* Galeria: visor de fotografias com botões e setas do teclado */
  var visor = document.getElementById('visor');
  var fotografias = document.querySelectorAll('.galeria-item a');

  if (visor && fotografias.length && typeof visor.showModal === 'function') {
    var imagemVisor = document.getElementById('visor-imagem');
    var legendaVisor = document.getElementById('visor-legenda');
    var contagemVisor = document.getElementById('visor-contagem');
    var atual = 0;

    var mostrarFotografia = function (indice) {
      atual = (indice + fotografias.length) % fotografias.length;
      var ligacao = fotografias[atual];
      imagemVisor.src = ligacao.getAttribute('href');
      imagemVisor.alt = ligacao.querySelector('img').alt;
      legendaVisor.textContent = ligacao.closest('figure').querySelector('figcaption').textContent;
      contagemVisor.textContent = (atual + 1) + ' de ' + fotografias.length;
    };

    fotografias.forEach(function (ligacao, indice) {
      ligacao.addEventListener('click', function (evento) {
        evento.preventDefault();
        mostrarFotografia(indice);
        visor.showModal();
      });
    });

    visor.querySelector('[data-visor="anterior"]').addEventListener('click', function () {
      mostrarFotografia(atual - 1);
    });

    visor.querySelector('[data-visor="seguinte"]').addEventListener('click', function () {
      mostrarFotografia(atual + 1);
    });

    visor.querySelector('[data-visor="fechar"]').addEventListener('click', function () {
      visor.close();
    });

    visor.addEventListener('click', function (evento) {
      if (evento.target === visor) {
        visor.close();
      }
    });

    visor.addEventListener('keydown', function (evento) {
      if (evento.key === 'ArrowLeft') {
        mostrarFotografia(atual - 1);
      } else if (evento.key === 'ArrowRight') {
        mostrarFotografia(atual + 1);
      }
    });
  }
  /* Início: fundo do hero com imagens das notícias */
  var hero = document.querySelector('[data-hero-rotator]');
  var diapositivos = hero ? hero.querySelectorAll('.hero-slide') : [];
  var botaoPausa = hero ? hero.querySelector('.hero-pausa') : null;
  var caixaDots = hero ? hero.querySelector('.hero-dots') : null;
  var newsTitulo = hero ? hero.querySelector('.hero-news-titulo') : null;
  var newsMeta = hero ? hero.querySelector('.hero-news-meta') : null;

  if (diapositivos.length > 1) {
    var indiceAtual = 0;
    var temporizador = null;
    var semMovimento = window.matchMedia &&
                       window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var emPausa = Boolean(semMovimento);
    var dots = [];

    var atualizarLegenda = function (slide) {
      if (!newsTitulo || !newsMeta) {
        return;
      }
      var titulo = slide.getAttribute('data-titulo') || '';
      var meta = slide.getAttribute('data-meta') || '';
      var link = slide.getAttribute('data-link') || 'noticias.html';
      newsTitulo.textContent = titulo;
      newsTitulo.setAttribute('href', link);
      newsMeta.textContent = meta;
    };

    var mostrarDiapositivo = function (novo) {
      diapositivos[indiceAtual].classList.remove('is-active');
      if (dots[indiceAtual]) {
        dots[indiceAtual].setAttribute('aria-selected', 'false');
      }
      indiceAtual = (novo + diapositivos.length) % diapositivos.length;
      diapositivos[indiceAtual].classList.add('is-active');
      if (dots[indiceAtual]) {
        dots[indiceAtual].setAttribute('aria-selected', 'true');
      }
      atualizarLegenda(diapositivos[indiceAtual]);
    };

    if (caixaDots) {
      diapositivos.forEach(function (slide, indice) {
        var botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'hero-dot';
        botao.setAttribute('role', 'tab');
        botao.setAttribute('aria-label', 'Imagem ' + (indice + 1) + ': ' +
          (slide.getAttribute('data-titulo') || ''));
        botao.setAttribute('aria-selected', String(indice === 0));
        botao.addEventListener('click', function () {
          mostrarDiapositivo(indice);
          if (!emPausa) {
            pararRotacao();
            iniciarRotacao();
          }
        });
        caixaDots.appendChild(botao);
        dots.push(botao);
      });
    }

    var iniciarRotacao = function () {
      if (!temporizador) {
        temporizador = setInterval(function () {
          mostrarDiapositivo(indiceAtual + 1);
        }, 5500);
      }
    };

    var pararRotacao = function () {
      clearInterval(temporizador);
      temporizador = null;
    };

    var atualizarBotao = function () {
      if (!botaoPausa) {
        return;
      }
      botaoPausa.textContent = emPausa ? 'Reproduzir' : 'Pausar';
      botaoPausa.setAttribute('aria-pressed', String(emPausa));
    };

    if (botaoPausa) {
      botaoPausa.hidden = false;
      atualizarBotao();
      botaoPausa.addEventListener('click', function () {
        emPausa = !emPausa;
        atualizarBotao();
        if (emPausa) {
          pararRotacao();
        } else {
          iniciarRotacao();
        }
      });
    }

    atualizarLegenda(diapositivos[0]);

    if (!emPausa) {
      iniciarRotacao();
    }
  }
  /* Barra de progresso no topo da página */
  var barraProgresso = document.createElement('div');
  barraProgresso.className = 'barra-progresso';
  barraProgresso.setAttribute('aria-hidden', 'true');
  document.body.appendChild(barraProgresso);

  var atualizarProgresso = function () {
    var disponivel = document.documentElement.scrollHeight - window.innerHeight;
    var fracao = disponivel > 0 ? window.scrollY / disponivel : 0;
    barraProgresso.style.transform = 'scaleX(' + Math.min(fracao, 1) + ')';
  };

  window.addEventListener('scroll', atualizarProgresso, { passive: true });
  window.addEventListener('resize', atualizarProgresso);
  atualizarProgresso();

  /* Entrada suave dos blocos ao aparecerem no ecrã */
  var seletoresAnimados = '.section-head, .card, .noticia, .info-item, .painel, .split > *, ' +
    '.galeria-item, .passos li, .faq details, .formulario, .cta .container > *, ' +
    '.page-hero .container > *, .ver-todas, .caminho, .destaque-noticia, .intro-copy, ' +
    '.intro-aside, .mosaico-item, .factos-grid li';

  if ('IntersectionObserver' in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-visible');
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(seletoresAnimados).forEach(function (elemento) {
      var irmaos = elemento.parentElement
        ? Array.prototype.slice.call(elemento.parentElement.children)
        : [elemento];
      var posicao = irmaos.indexOf(elemento);

      elemento.classList.add('reveal');
      elemento.style.setProperty('--atraso', ((posicao % 4) * 100) + 'ms');
      observador.observe(elemento);
    });
  }
})();
