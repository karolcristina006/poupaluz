// ----- Mobile nav toggle -----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if(navToggle && navLinks){
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

// ----- Multi-step form -----
  const form = document.getElementById('leadForm');
  if(form){
  const steps = Array.from(form.querySelectorAll('.step'));
  const progressDots = Array.from(document.querySelectorAll('.progress-track i'));
  const gaugeArc = document.getElementById('gaugeArc');
  const gaugeNeedle = document.getElementById('gaugeNeedle');
  let current = 1;
  const total = steps.length;
  const answers = { tipo_energia: '' };

  function setGauge(stepIndex){
    const pct = stepIndex / total; // 0..1
    const circumference = 113; // approx path length
    const offset = circumference - (circumference * pct);
    gaugeArc.style.strokeDashoffset = offset;
    const angle = -90 + (180 * pct);
    gaugeNeedle.setAttribute('transform', `rotate(${angle} 32 50)`);
  }

  function goToStep(n){
    steps.forEach(s => s.classList.toggle('active', parseInt(s.dataset.step) === n));
    progressDots.forEach(d => d.classList.toggle('active', parseInt(d.dataset.step) <= n));
    current = n;
    setGauge(n);
    if(n === 4) buildSummary();
  }

  function buildSummary(){
    const tipo = answers.tipo_energia || '—';
    const potencia = document.getElementById('potencia').value || '—';
    const fornecedor = document.getElementById('fornecedor').value || '—';
    document.getElementById('resumoTexto').textContent =
      `${tipo} · ${potencia} · atualmente em ${fornecedor}`;
  }

  // option cards (step 1)
  document.querySelectorAll('[data-group="tipo_energia"] .option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-group="tipo_energia"] .option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      answers.tipo_energia = card.dataset.value;
    });
  });

  function validateStep(n){
    if(n === 1){
      if(!answers.tipo_energia){ alert('Por favor escolhe o tipo de energia.'); return false; }
    }
    if(n === 3){
      const nome = document.getElementById('nome');
      const tel = document.getElementById('telefone');
      const email = document.getElementById('email');
      if(!nome.value.trim() || !tel.value.trim() || !email.value.trim()){
        alert('Por favor preenche nome, telemóvel e email.');
        return false;
      }
      if(!/^\S+@\S+\.\S+$/.test(email.value)){
        alert('Indica um email válido.');
        return false;
      }
    }
    return true;
  }

  form.addEventListener('click', e => {
    if(e.target.matches('[data-next]')){
      if(validateStep(current)) goToStep(Math.min(current + 1, total));
    }
    if(e.target.matches('[data-prev]')){
      goToStep(Math.max(current - 1, 1));
    }
  });

  // terms checkbox enables submit
  const termos = document.getElementById('termos');
  const submitBtn = document.getElementById('submitBtn');
  termos.addEventListener('change', () => { submitBtn.disabled = !termos.checked; });

  // Cola aqui o URL do teu Google Apps Script (Passo 2, item 7)
  const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxmCGJkAcocjDPw9D9ciFTgqUYEaHBCcisqboPAscS6gtyN5ZNid4S4-HKL5mu9gT0XNQ/exec';

  form.addEventListener('submit', e => {
    e.preventDefault();
    if(!termos.checked) return;

    const payload = {
      tipo_energia: answers.tipo_energia,
      potencia: document.getElementById('potencia').value,
      fornecedor_atual: document.getElementById('fornecedor').value,
      nome: document.getElementById('nome').value,
      telefone: document.getElementById('telefone').value,
      email: document.getElementById('email').value,
      codigo_postal: document.getElementById('cp').value
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'A enviar...';

    // mode 'no-cors': o Apps Script não devolve cabeçalhos CORS legíveis pelo
    // browser, por isso não tentamos ler a resposta — só confirmamos que o
    // pedido foi enviado. Os dados continuam a ser gravados normalmente na Sheet.
    fetch(SHEET_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    })
    .then(() => {
      form.style.display = 'none';
      document.querySelector('.progress-track').style.display = 'none';
      document.getElementById('successBox').classList.add('active');
    })
    .catch(err => {
      console.error('Erro ao enviar lead:', err);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Receber a minha simulação';
      alert('Não foi possível enviar o pedido. Verifica a tua ligação e tenta novamente.');
    });
  });

  setGauge(1);
  } // fim do bloco do formulário (só existe na home)

  // ----- FAQ accordion -----
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if(!isOpen) item.classList.add('open');
    });
  });