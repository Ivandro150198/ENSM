/* =========================================================
   Escola Nacional de Surdos e Mudos da Guiné-Bissau
   Comportamentos do site: menu, ano e formulário de contacto
   ========================================================= */
(function () {
  'use strict';

  /* Ano atual no rodapé */
  var ano = document.getElementById('ano');
  if (ano) {
    ano.textContent = new Date().getFullYear();
  }

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

  /* Formulário de contacto
     Não há servidor a receber os dados: o formulário abre o programa de email
     do visitante com a mensagem já preenchida, dirigida ao endereço definido
     no atributo data-destino do formulário (contacto.html). */
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
        estado.textContent = 'Revise os campos assinalados antes de enviar.';
        primeiroInvalido.focus();
        return;
      }

      var nome = formulario.nome.value.trim();
      var email = formulario.email.value.trim();
      var telefone = formulario.telefone.value.trim() || 'Não indicado';
      var assunto = formulario.assunto.value;
      var mensagem = formulario.mensagem.value.trim();
      var destino = formulario.getAttribute('data-destino');

      var corpo = 'Nome: ' + nome + '\n' +
                  'Email: ' + email + '\n' +
                  'Telefone: ' + telefone + '\n\n' +
                  mensagem;

      var ligacao = 'mailto:' + destino +
                    '?subject=' + encodeURIComponent('[Site] ' + assunto) +
                    '&body=' + encodeURIComponent(corpo);

      window.location.href = ligacao;

      estado.textContent = 'Se o seu programa de email não abrir, escreva diretamente para ' +
                           destino + ' com o assunto "' + assunto + '".';
    });
  }
  /* Notícias: filtro por categoria */
  var filtros = document.querySelectorAll('.filtro');
  var listaNoticias = document.querySelectorAll('#lista-noticias .noticia');
  var contador = document.getElementById('contador-noticias');

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

        if (contador) {
          contador.textContent = 'A mostrar ' + visiveis +
                                 (visiveis === 1 ? ' notícia.' : ' notícias.');
        }
      });
    });
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
  /* Início: imagens de fundo do destaque, com pausa */
  var diapositivos = document.querySelectorAll('.hero-slide');
  var botaoPausa = document.querySelector('.hero-pausa');

  if (diapositivos.length > 1) {
    var indiceAtual = 0;
    var temporizador = null;
    var semMovimento = window.matchMedia &&
                       window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var emPausa = Boolean(semMovimento);

    var mostrarDiapositivo = function (novo) {
      diapositivos[indiceAtual].classList.remove('is-active');
      indiceAtual = (novo + diapositivos.length) % diapositivos.length;
      diapositivos[indiceAtual].classList.add('is-active');
    };

    var iniciarRotacao = function () {
      if (!temporizador) {
        temporizador = setInterval(function () {
          mostrarDiapositivo(indiceAtual + 1);
        }, 6000);
      }
    };

    var pararRotacao = function () {
      clearInterval(temporizador);
      temporizador = null;
    };

    var atualizarBotao = function () {
      botaoPausa.textContent = emPausa ? 'Reproduzir imagens' : 'Pausar imagens';
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

    if (!emPausa) {
      iniciarRotacao();
    }
  }
})();
