import type { TranslationBundle } from '../../types/check';

export const es: TranslationBundle = {
  brandName: 'Investor Scam Check',
  footerTag: 'Demo educativa previa al pago',
  demoBanner:
    'Prototipo de demostración: utiliza solo reglas de ejemplo. No se conecta con registros oficiales de SEBI en tiempo real, no verifica cuentas bancarias ni garantiza que ninguna oferta sea segura.',
  nav: {
    checkMessage: 'Revisar mensaje',
    reviewGroupChat: 'Revisar un chat grupal',
    checkPayment: 'Revisar pago',
    howItWorks: 'Cómo funciona',
    about: 'Acerca de',
  },
  languageLabel: 'Seleccionar idioma',
  menuOpen: 'Abrir menú de navegación',
  menuClose: 'Cerrar menú de navegación',
  hero: {
    kicker: 'Guía de verificación previa al pago · Pensada para familias',
    title: 'Haz una pausa antes de pagar. Conecta cada pista en una sola revisión.',
    subtitle:
      'Las propuestas de inversión sospechosas suelen mezclar un mensaje urgente, un ID de SEBI copiado, un enlace imitado y un identificador de pago personal. Revisa los cuatro elementos juntos en lenguaje claro antes de enviar dinero.',
  },
  statusTags: {
    highRiskVerdict: 'Se encontraron señales de advertencia',
    cautionVerdict: 'Se encontraron señales de advertencia',
    cantVerifyVerdict: 'No se encontraron señales de alerta listadas',
    highRiskBadge: 'Se encontraron señales de advertencia',
    cautionBadge: 'Se encontraron señales de advertencia',
    cantVerifyBadge: 'No se encontraron señales de alerta listadas',
    notVerifiedBadge: 'No verificado por esta demo',
    notProvidedBadge: 'No proporcionado',
  },
  breakdown: {
    messageSummaryTitle: 'Resumen de la revisión en 4 partes',
    paymentSummaryTitle: 'Señales de pago revisadas',
    highRiskCount: (n) => `${n} Señales de advertencia`,
    cautionCount: (n) => `${n} Señales de advertencia`,
    unverifiedCount: (n) => `${n} Sin señales listadas`,
    notEnteredCount: (n) => `${n} No proporcionado`,
  },
  checkBasis: {
    patternClues: 'Solo pistas de texto · No es verificación oficial',
    formatOnly: 'Solo revisión de formato · Sin consulta en vivo',
    notProvided: 'No proporcionado',
    unverifiedLive: 'Consulta en vivo no disponible · Verifica directamente',
  },
  messageCheck: {
    presetsTitle: 'Prueba un ejemplo realista de demostración',
    presetsHint: 'Toca un ejemplo para ver cómo se conectan los cuatro detalles, o ingresa los tuyos abajo.',
    clearBtn: 'Limpiar formulario',
    graphTitle: '4 pistas, una revisión conectada',
    graphProgress: (filled) =>
      filled === 0
        ? '0 de 4 pistas agregadas — toca cualquier nodo para empezar'
        : `${filled} de 4 pistas agregadas`,
    nodeEmpty: 'Vacío',
    nodeEntered: 'Agregado',
    nodeFocusHint: (label) => `Ir al campo ${label}`,
    formTitle: '1. Ingresa los detalles que recibiste',
    formSubtitle: 'Completa lo que tengas — incluso uno o dos datos ayudan a detectar señales de riesgo.',
    cluesCount: (filled) => `${filled}/4 pistas`,
    stepperAriaLabel: 'Progreso de la revisión en cuatro partes',
    steps: {
      message: 'Mensaje',
      sebi: 'ID SEBI',
      link: 'Enlace',
      payment: 'Pago',
    },
    pillarTitles: {
      message: 'Mensaje y promesas',
      sebi: 'Registro SEBI declarado',
      link: 'Enlace de sitio web o app',
      payment: 'Cuenta de pago y solicitud',
    },
    fields: {
      messageLabel: 'Mensaje o propuesta de inversión (WhatsApp / Telegram / SMS)',
      messagePlaceholder:
        'Pega aquí el texto del mensaje (ej. "25% de ganancia mensual garantizada, últimos cupos solo hoy...")',
      sebiLabel: 'Número de registro SEBI declarado o nombre de la empresa (Opcional)',
      sebiPlaceholder: 'ej. INA000012345 o nombre de la firma',
      sebiHelper:
        'Puedes dejarlo en blanco si no tienes uno. Si se indica un número, compruébalo directamente en investor.sebi.gov.in.',
      linkLabel: 'Enlace del sitio web o descarga de la app',
      linkPlaceholder: 'ej. https://example.in o enlace de descarga',
      paymentLabel: 'ID de UPI, cuenta bancaria o solicitud de pago',
      paymentPlaceholder: 'ej. nombre@okaxis o datos de cuenta IMPS',
      amountLabel: 'Monto solicitado (₹)',
      amountPlaceholder: 'ej. 25000',
    },
    submitBtn: 'Revisar indicadores de riesgo',
    checkingBtn: 'Revisando pistas...',
    updatedBadge: 'Actualizado',
    validationError:
      'Ingresa al menos un dato (mensaje, registro SEBI, enlace o pago) o elige un ejemplo de demostración.',
    resultTitle: '2. Revisión conjunta previa al pago',
    tileInspectHint: 'Selecciona una tarjeta para abrir e ir a su explicación',
    tileViewing: 'Abierto',
    tileSelectPrompt: (title) => `Inspeccionar ${title}`,
    connectionHeading: 'Cómo se conectan estos detalles',
    pillarsHeading: 'Desglose en cuatro partes',
    evidenceLabel: 'Frase coincidente en el texto:',
    nextStepsHeading: 'Pasos tranquilos antes de pagar',
    shareBtn: 'Copiar resumen para la familia',
    shareCopied: 'Copiado para la familia',
    emptyTitle: 'Listo para revisar antes de pagar',
    emptyBody:
      'Completa el mensaje, ID de SEBI declarado, enlace o solicitud de pago a la izquierda — o toca un ejemplo arriba — para ver un análisis claro aquí.',
  },
  aiReview: {
    triggerBtn: 'Obtener una revisión en lenguaje sencillo',
    loadingBtn: 'Generando revisión de IA...',
    panelTitle: 'Revisión opcional con IA en lenguaje sencillo',
    panelSubtitle:
      'Lectura contextual adicional mediante IA. La comprobación basada en reglas de arriba siempre funciona sin IA.',
    consentTitle: 'Antes de enviar este mensaje al servicio de IA',
    consentBody:
      'El texto del mensaje pegado (ocultando cualquier PIN, OTP, CVV, contraseña y número completo de cuenta bancaria o tarjeta) se enviará al servicio de IA para generar una revisión en lenguaje sencillo. No se envía a Búsqueda de Google ni se guarda en ninguna base de datos.',
    consentContinueBtn: 'Continuar',
    consentDemoOnlyBtn: 'Usar solo la comprobación demo',
    unavailableTitle: 'La revisión por IA no está disponible ahora',
    unavailableNotConfigured:
      'No hay credenciales de IA activas en el servidor en este entorno. Todavía puedes usar la comprobación local por reglas y los portales oficiales.',
    unavailableError:
      'El servicio de IA no pudo completar esta revisión en este momento. Tu comprobación local sigue activa y disponible.',
    verdictWarningSigns: 'Se encontraron señales de alerta',
    verdictNoListedSigns: 'No se encontraron señales de alerta listadas',
    warningSignsHeading: 'Posibles señales de alerta detectadas',
    supportingPhraseLabel: 'Frase de respaldo:',
    noSignsFoundNote:
      'No encontrar señales de alerta no demuestra que este mensaje sea genuino, autorizado o seguro.',
    nextStepsHeading: 'Siguientes pasos prácticos',
    insufficientEvidenceHeading: 'Nota de evidencia insuficiente',
    limitationsHeading: 'Límites de verificación',
    limitationsBody:
      'Esta lectura con IA solo analiza el texto y el contexto. No puede verificar registros en vivo de SEBI, cuentas bancarias, IDs de UPI, códigos QR ni sitios web.',
    missingMessageError:
      'Pega o selecciona un mensaje arriba antes de solicitar una revisión con IA.',
    privacyBadge: 'Sin guardar en BD · Sin Búsqueda web',
    uncertainNote:
      'Lectura de IA incierta · no es una prueba, ni una consulta en vivo de SEBI, ni asesoría financiera.',
    localOnlyBadge: 'Funciona sin IA · Pistas locales de patrón',
  },
  printSummary: {
    printBtn: 'Imprimir o guardar resumen',
    familyDocKicker: 'Investor Scam Check · Resumen imprimible para la familia',
    messageDocTitle: 'Resumen de revisión previa al pago (mensaje y pistas)',
    paymentDocTitle: 'Resumen de verificación previa de pago',
    verdictLabel: 'Resultado de la revisión',
    findingsLabel: 'Pistas y frases de evidencia revisadas',
    missingInfoLabel: 'Información faltante o no verificada',
    nextStepsLabel: 'Siguientes pasos prácticos',
    aiSectionLabel: 'Revisión de IA en lenguaje sencillo (solo esta sesión)',
    officialLinksLabel: 'Verifica directamente en portales oficiales',
    privacyExclusionNote:
      'Protección de privacidad: los mensajes completos pegados, PIN de UPI, OTP, contraseñas, CVV, códigos IFSC, números completos de cuenta/tarjeta y usuarios personales de UPI se excluyen por defecto de este resumen imprimible.',
  },
  officialVerify: {
    title: 'Verifica en fuentes oficiales',
    subtitle:
      'Abre directamente los portales oficiales de SEBI, RBI, NPCI y Cyber Crime para comprobar cualquier asesor, cuenta de pago, app de trading o canal de denuncia.',
    sebiLookupLabel: 'Buscador de registro SEBI',
    sebiLookupDesc:
      'Verifica asesores, brókeres y analistas registrados por nombre o código INA/INH/INZ en sebi.gov.in.',
    sebiCheckLabel: 'SEBI Check (UPI, QR y banco)',
    sebiCheckDesc:
      'Comprueba identificadores @valid de UPI, códigos QR y cuentas bancarias/IFSC en siportal.sebi.gov.in.',
    appsListLabel: 'Soporte SEBI y Apps autorizadas',
    appsListDesc:
      'Verifica registros de intermediarios y abre directorios bursátiles oficiales de apps autorizadas.',
    spotScamLabel: 'Guía SEBI para detectar estafas',
    spotScamDesc:
      'Lista oficial de SEBI sobre suplantaciones, grupos VIP y promesas de ganancias garantizadas.',
    fakeAppsPdfLabel: 'Guía SEBI de apps falsas (PDF)',
    fakeAppsPdfDesc:
      'Documento oficial de SEBI que explica cómo operan las apps de trading clonadas y archivos .apk.',
    rbiSafetyLabel: 'Banca digital segura (RBI)',
    rbiSafetyDesc:
      'Recomendaciones oficiales del RBI para proteger PIN/OTP y revisar al destinatario antes de pagar.',
    npciAwarenessLabel: 'Prevención UPI de NPCI',
    npciAwarenessDesc:
      'Guía oficial de UPI: ingresar tu PIN solo envía dinero hacia afuera, nunca recibe reembolsos.',
    cyberCrimeLabel: 'Portal Nacional Cyber Crime (1930)',
    cyberCrimeDesc:
      'Ante fraude cibernético, UPI o bancario: avisa a tu banco de inmediato, llama al 1930 y denuncia en cybercrime.gov.in.',
    scoresLabel: 'Portal SEBI SCORES',
    scoresDesc:
      'Presenta quejas formales únicamente sobre intermediarios registrados en SEBI en scores.sebi.gov.in.',
    guidanceStripTitle: 'Guías oficiales, banca segura y canales de denuncia',
    qrUnavailableNote:
      'El escaneo de códigos QR e imágenes de capturas no está disponible en esta demo y nunca se verifica en vivo aquí.',
    openPortalBtn: 'Abrir portal oficial',
  },
  paymentCheck: {
    kicker: 'Control previo a la transferencia · UPI, QR y transferencia bancaria',
    title: '¿Vas a enviar dinero? Revisa primero la solicitud de pago.',
    subtitle:
      'Antes de ingresar tu PIN de UPI o confirmar una transferencia IMPS/NEFT, verifica si el identificador de pago, el origen y el nombre del destinatario coinciden.',
    presetsTitle: 'Prueba un escenario de pago',
    clearBtn: 'Limpiar',
    formTitle: 'Detalles de la solicitud de pago',
    fields: {
      methodLabel: '¿Cómo te piden que pagues?',
      methods: {
        upi: 'UPI / VPA',
        bank_transfer: 'Banco IMPS/NEFT',
        qr_or_link: 'QR / Enlace de pago',
      },
      methodHints: {
        upi: 'Pago a nombre@banco',
        bank_transfer: 'Transferencia cuenta + IFSC',
        qr_or_link: 'Escanear QR o abrir enlace',
      },
      handleLabel: 'ID de UPI, número de cuenta o enlace de pago',
      handlePlaceholderUpi: 'ej. sample.desk@okaxis',
      handlePlaceholderBank: 'ej. Número de cuenta 4001928374',
      handlePlaceholderQr: 'ej. Enlace de pago u origen del código QR',
      ifscLabel: 'Código IFSC (opcional)',
      ifscPlaceholder: 'ej. DEMO0001234',
      amountLabel: 'Monto solicitado (₹)',
      amountPlaceholder: 'ej. 25000',
      entityLabel: 'Empresa / asesor declarado',
      entityPlaceholder: 'ej. Sample Wealth Advisory',
      sourceLabel: '¿De dónde llegó esta solicitud de pago?',
      sources: {
        whatsapp_telegram: 'Grupo o chat de WhatsApp o Telegram',
        trading_app: 'App de trading descargada o portal web',
        adviser_claim: 'Supuesto asesor de SEBI o llamada',
        other: 'Otro / En persona',
      },
      matchLabel: '¿El nombre verificado por el banco coincide con la empresa declarada?',
      matches: {
        matches: 'Sí, coincide exactamente con la empresa',
        different: 'No, muestra un nombre personal o diferente',
        unsure: 'No estoy seguro / aún no lo he revisado',
      },
    },
    submitBtn: 'Revisar riesgos del pago',
    checkingBtn: 'Revisando pago...',
    updatedBadge: 'Actualizado',
    validationError: 'Ingresa primero un identificador de pago, monto o nombre de empresa.',
    resultTitle: 'Revisión del pago y lista previa a la transferencia',
    findingsHeading: 'Qué llama la atención',
    checklistHeading: 'Revisa estos 4 puntos antes de tocar Pagar',
    checklistProgress: (checked, total) => `${checked} de ${total} revisados`,
    checklistComplete: 'Los 4 puntos revisados',
    emptyTitle: 'Verifica antes de ingresar tu PIN de UPI',
    emptyBody:
      'Ingresa el ID de UPI, cuenta bancaria o monto en ₹ que vas a pagar para revisar señales comunes de advertencia y una lista de control de 4 puntos.',
    qrHandoffHeading: 'Verifica este código QR con SEBI',
    qrHandoffDesc:
      'Esta demo no escanea ni verifica códigos QR. Abre SEBI Check para subir o escanear el código QR y comprobar los datos de pago directamente.',
    qrHandoffBtn: 'Abrir SEBI Check',
  },
  presets: {
    message: {
      'guaranteed-whatsapp': {
        title: 'Aviso de WhatsApp con "ganancia garantizada"',
        subtitle: 'Promete 25% de beneficio mensual + enlace imitado',
      },
      'pre-ipo-apk': {
        title: 'App Pre-IPO (.apk) y transferencia bancaria',
        subtitle: 'Enlace directo .apk + transferencia a cuenta de agente',
      },
      'incomplete-advisory': {
        title: 'Propuesta tranquila de asesoría (datos incompletos)',
        subtitle: 'Formato SEBI válido en apariencia, pero estado real sin verificar',
      },
    },
    payment: {
      'pay-whatsapp-upi': {
        title: 'Solicitud UPI desde grupo de Telegram',
        subtitle: '₹25,000 vía Telegram a identificador @ybl, otro nombre',
      },
      'pay-qr-refund': {
        title: 'Código QR para "recibir ganancias"',
        subtitle: 'Escaneo QR de ₹15,000 desde supuesta app de trading',
      },
      'pay-bank-imps': {
        title: 'Transferencia IMPS a cuenta sin confirmar',
        subtitle: 'Transferencia de ₹1,00,000 por supuesta tarifa de asesoría',
      },
    },
  },
  howItWorks: {
    kicker: 'Cómo funciona',
    title: 'Por qué revisar una sola pista no es suficiente',
    subtitle:
      'Alguien puede copiar un número real de registro SEBI en un folleto atractivo — mientras te dirige a un sitio web imitado y a un ID de UPI personal. Analizar las cuatro pistas juntas deja al descubierto las inconsistencias.',
    diagramTitle: 'La conexión en 4 partes',
    steps: [
      {
        num: '01',
        title: 'El mensaje y las promesas',
        desc: 'Busca promesas de ganancias garantizadas, beneficios diarios o mensuales fijos, o presión de "cierra hoy".',
      },
      {
        num: '02',
        title: 'Registro SEBI declarado',
        desc: 'Comprueba si el identificador sigue el formato estándar de SEBI (INA/INH/INZ) y recuerda cómo verificarlo directamente en el portal oficial.',
      },
      {
        num: '03',
        title: 'Enlace web o de app',
        desc: 'Señala descargas directas .apk, enlaces acortados y dominios que imitan a brókeres conocidos.',
      },
      {
        num: '04',
        title: 'Cuenta y flujo de pago',
        desc: 'Destaca identificadores UPI de consumo personal, cuentas de ahorro individuales o diferencias en el nombre del titular.',
      },
    ],
    scopeTitle: 'Qué revisa esta demo vs. qué requiere verificación oficial',
    canDoTitle: 'Incluido en esta demostración',
    canDoList: [
      'Análisis en lenguaje claro de urgencia, promesas de ganancia segura y cobros previos',
      'Comprobación del patrón de formato de registro SEBI (INA / INH / INZ)',
      'Revisión de enlaces para descargas .apk, acortadores y términos imitados',
      'Cruce entre el contexto de la oferta y solicitudes a UPI personales o cuentas bancarias',
    ],
    cannotDoTitle: 'No disponible en la demo (verifica oficialmente)',
    cannotDoList: [
      'Consulta en vivo contra la base oficial de intermediarios registrados en SEBI',
      'Verificación en tiempo real en NPCI / banco del titular de un ID de UPI',
      'Comprobación en vivo de antigüedad del dominio, certificado SSL o app oficial del bróker',
      'Cualquier garantía o promesa de que un asesor, enlace o pago sea seguro',
    ],
    patternsTitle: 'Patrones frecuentes que enfrentan los inversores minoristas en India',
    patternTag: 'Patrón de riesgo común',
    patterns: [
      {
        title: 'Grupos falsos "VIP institucionales" en WhatsApp',
        desc: 'Mensajes que prometen "20–30% de beneficio mensual" o consejos exclusivos, usando a menudo nombres copiados de analistas conocidos.',
      },
      {
        title: 'Apps de trading instaladas fuera de tienda (.apk)',
        desc: 'Enlaces enviados por chat para instalar apps fuera de Google Play o Apple App Store, mostrando ganancias ficticias para pedir depósitos mayores.',
      },
      {
        title: '"Impuesto" o "tarifa de desbloqueo" antes de retirar',
        desc: 'Pedir depósitos adicionales en ₹ antes de dejarte retirar tu propio dinero — los brókeres regulados deducen impuestos automáticamente, nunca mediante transferencias UPI aparte.',
      },
    ],
  },
  about: {
    kicker: 'Acerca de Investor Scam Check · Demo educativa',
    title: 'Diseñado para tomar decisiones tranquilas y claras antes de que salga dinero de tu cuenta.',
    intro:
      'Investor Scam Check es una demo educativa creada para ayudar a inversores primerizos, adultos mayores y familiares a detenerse y revisar juntos propuestas de inversión sospechosas.',
    principlesTitle: 'Nuestros principios de diseño',
    principles: [
      {
        title: 'Lenguaje sereno y claro',
        desc: 'Señalamos indicadores de riesgo concretos con palabras sencillas — sin acusar a personas ni generar pánico.',
      },
      {
        title: 'Honestos sobre los límites',
        desc: 'Cuando esta demo no puede consultar registros reales de SEBI o bancos, mostramos claramente "No se puede verificar" y nunca prometemos seguridad.',
      },
      {
        title: 'Pensado para familias y adultos mayores',
        desc: 'Tipografía grande y legible, iconos junto a cada color, soporte multilingüe y resúmenes fáciles de compartir en familia.',
      },
    ],
    directoryTitle: 'Portales oficiales en India para verificar y reportar',
    directoryNote: 'Escribe siempre las direcciones oficiales directamente o ábrelas desde marcadores confiables:',
    resources: [
      {
        name: 'Soporte para inversores de SEBI y apps de trading',
        detail:
          'investor.sebi.gov.in/Investor-support.html · Verifica asesores, brókeres y enlaces oficiales de apps autorizadas.',
      },
      {
        name: 'SEBI SCORES (solo entidades registradas en SEBI)',
        detail:
          'scores.sebi.gov.in · Presenta reclamos únicamente sobre intermediarios registrados en SEBI.',
      },
      {
        name: 'Línea y portal contra delitos cibernéticos',
        detail:
          'Ante fraude cibernético, UPI o bancario: avisa a tu banco de inmediato, llama al 1930 y denuncia en cybercrime.gov.in.',
      },
      {
        name: 'Portal RBI Sachet',
        detail: 'sachet.rbi.org.in · Consulta o reporta entidades no autorizadas que captan depósitos.',
      },
    ],
  },
  postIncidentHelp: {
    triggerBtn: 'Ya pagué o compartí datos',
    triggerHint:
      '¿Ya enviaste dinero, compartiste un OTP/PIN, abriste un enlace o instalaste una app? Consulta pasos claros sin ingresar datos privados.',
    modalTitle: 'Ya pagué o compartí datos',
    modalSubtitle:
      'Elige lo que ocurrió para ver pasos tranquilos en lenguaje claro. No ingreses números de cuenta, tarjetas, OTP, PIN ni contraseñas aquí.',
    privacyBadge: 'Sin guardar datos · Sin IA · Solo fuentes oficiales',
    selectPrompt: '¿Qué ocurrió?',
    closeBtn: 'Cerrar guía de ayuda',
    backToCheckerBtn: 'Volver al verificador de mensajes',
    urgentRuleNote:
      'Si ya se retiró o envió dinero, contacta a tu banco y repórtalo lo antes posible.',
    reportingTitle: 'Reporta el fraude financiero en línea cuanto antes',
    reportingBody:
      'Llama a la línea nacional 1930 o presenta un reporte directo en el portal oficial National Cyber Crime Reporting Portal (https://cybercrime.gov.in/).',
    reportingPortalLabel: 'Abrir portal oficial cybercrime.gov.in',
    helplineBadge: 'Línea: 1930',
    sourcesTitle: 'Guías oficiales de RBI, Cyber Crime y SEBI',
    rbiPdfLabel: 'Guía RBI sobre transacciones electrónicas no autorizadas (PDF)',
    cyberPortalLabel: 'Portal Nacional de Delitos Cibernéticos',
    sebiFakeAppPdfLabel: 'Guía SEBI sobre apps falsas de trading (PDF)',
    disclaimerNote:
      'Solo orientación general de seguridad: no constituye investigación bancaria, asesoría legal ni garantía o plazo de recuperación de fondos. Esta demo no ha contactado a ningún banco, bloqueado cuentas, verificado transacciones, revisado tu dispositivo ni guardado tu selección, y no envía nada a la IA.',
    choices: {
      paid: {
        label: 'Envié dinero o aprobé un pago.',
        shortHint: 'Transferencia bancaria, UPI, QR o aprobación ya realizada',
        heading: 'Pasos si enviaste dinero o aprobaste un pago',
        summary: 'Actúa de inmediato a través de los canales oficiales de tu banco y denuncia el fraude.',
        steps: [
          'Contacta de inmediato a tu banco o proveedor de pagos mediante su aplicación oficial, sitio web oficial o teléfono verificado por tu cuenta (nunca uses teléfonos del mensaje sospechoso).',
          'Reporta el fraude financiero en línea llamando al 1930 o en https://cybercrime.gov.in/.',
          'Conserva los mensajes, números y comprobantes o registros de la transacción para tu banco o las autoridades.',
        ],
        showReportingCard: true,
      },
      shared_secret: {
        label: 'Compartí un OTP, PIN, contraseña o dato de tarjeta.',
        shortHint: 'Se entregaron códigos, claves o información bancaria confidencial',
        heading: 'Pasos si compartiste un OTP, PIN, contraseña o dato de tarjeta',
        summary: 'No compartas más códigos y contacta de inmediato a tu banco para asegurar la cuenta.',
        steps: [
          'No compartas más códigos OTP, PIN, contraseñas ni datos de tarjeta.',
          'Comunícate de inmediato con tu banco o proveedor de pagos por canales oficiales y sigue sus instrucciones para asegurar la cuenta o el método de pago afectado.',
          'Si hubo algún débito o retiro de dinero, repórtalo también en el 1930 y en https://cybercrime.gov.in/ lo antes posible.',
        ],
        showReportingCard: true,
      },
      clicked_or_installed: {
        label: 'Hice clic en un enlace o instalé una aplicación.',
        shortHint: 'Se abrió un enlace o se instaló una app o archivo .apk externo',
        heading: 'Pasos si hiciste clic en un enlace o instalaste una app',
        summary: 'Evita ingresar más datos o aprobar pagos y contacta a tu banco si entregaste información financiera.',
        deviceNotCheckedNote:
          'Importante: Esta herramienta NO ha revisado ni analizado tu dispositivo ni tu cuenta bancaria.',
        steps: [
          'No ingreses más información personal o bancaria ni apruebes solicitudes de pago.',
          'Si ingresaste datos financieros o notas una transacción no autorizada, contacta de inmediato a tu banco por canales oficiales y reporta en el 1930 o https://cybercrime.gov.in/.',
          'Consulta la guía oficial de SEBI sobre aplicaciones falsas de trading enlazada abajo.',
        ],
        showReportingCard: true,
      },
      not_acted: {
        label: 'Recibí un mensaje sospechoso pero no he actuado.',
        shortHint: 'No enviaste dinero, no diste claves ni instalaste apps',
        heading: 'Pasos si aún no has actuado',
        summary: 'Detenerte a tiempo te protege. No respondas ni realices pagos desde el mensaje.',
        steps: [
          'No respondas, no envíes dinero, no compartas secretos (OTP, PIN, contraseñas) ni instales apps desde el mensaje.',
          'Vuelve al verificador de mensajes para revisar indicios y confirmar registros directamente en portales oficiales de SEBI.',
        ],
        showReportingCard: false,
        showBackToChecker: true,
      },
    },
  },
  groupChat: {
    kicker: 'Revisión de varios mensajes · Explicación clara',
    title: 'Revisar un chat grupal',
    subtitle:
      'Pega varios mensajes relacionados juntos para ver posibles etapas y señales de alerta en lenguaje claro. Esta herramienta educativa no puede demostrar si una persona, grupo, empresa, oferta o mensaje es legítimo o fraudulento.',
    entryHint: '¿Recibiste varios mensajes en un grupo de WhatsApp o Telegram? Revísalos juntos.',
    switchSingleBtn: 'Verificar mensaje',
    privacyTitle: 'Elimina datos privados antes de pegar',
    privacyBody:
      'Por favor retira nombres reales, números de teléfono, cuentas bancarias, códigos OTP, PIN de UPI y contraseñas antes de pegar. Los secretos, teléfonos, correos y cuentas detectados se ocultan automáticamente antes de mostrarse, copiarse o enviarse a Gemini, y nada se guarda.',
    presetsTitle: 'Prueba una conversación de muestra (Ejemplos)',
    presetsHint: 'Cada botón carga un ejemplo ilustrativo: sospechoso, de seguridad, neutral o mixto.',
    exampleTagSuspicious: 'Ejemplo con riesgo',
    exampleTagGenuine: 'Ejemplo preventivo',
    exampleTagMixed: 'Ejemplo mixto',
    clearBtn: 'Limpiar chat',
    inputLabel: 'Pega aquí los mensajes relacionados del chat',
    inputPlaceholder:
      'Pega varios mensajes aquí (los nombres de hablantes y fechas son opcionales)...',
    formatHintTitle: 'Etiquetas de hablante y fechas aproximadas opcionales (ninguna es obligatoria)',
    formatHintBody: 'Puedes pegar líneas simples directamente o incluir hablante/fecha opcional así:',
    formatExamples: [
      '[Día 1] Admin: Bienvenido al grupo VIP...',
      '12 Oct - Miembro 1: Gracias por la ganancia...',
      'Línea simple sin etiqueta ni fecha',
    ],
    demoOnlyBtn: 'Usar solo verificación demo',
    checkingBtn: 'Revisando conversación...',
    aiReviewBtn: 'Obtener revisión con Gemini IA',
    aiLoadingBtn: 'Obteniendo revisión de Gemini...',
    validationError: 'Pega al menos un mensaje del chat o elige un ejemplo arriba.',
    consentTitle: 'Antes de enviar esta conversación a Gemini',
    consentBody:
      'El texto de la conversación pegada (con códigos OTP, PIN, contraseñas, CVV, tarjetas/cuentas, teléfonos, correos y usuarios UPI ocultados) será procesado por el servicio de IA Gemini para crear esta revisión estructurada. No se envía a Google Search grounding ni se guarda en ninguna base de datos, registro o almacenamiento.',
    consentContinueBtn: 'Continuar',
    consentDemoOnlyBtn: 'Usar solo verificación demo',
    unavailableTitle: 'La revisión con Gemini IA no está disponible ahora',
    unavailableNotConfigured:
      'No hay credenciales de IA activas en este servidor. Usa la verificación demo local abajo; funciona sin enviar datos.',
    unavailableError:
      'El servicio Gemini no pudo completar la revisión en este momento. Usa la verificación demo local y los portales oficiales de SEBI.',
    modeDemoBadge: 'Solo verificación demo (reglas locales)',
    modeAiBadge: 'Revisión Gemini IA (solo esta sesión)',
    privacyBadge: 'No se guarda · Datos ocultados · Sin Search',
    verdictWarningSigns: 'Señales de alerta encontradas',
    verdictNoListedSigns: 'No se encontraron señales de alerta listadas',
    noSafeProofNote:
      'No encontrar señales listadas NO demuestra que esta conversación, grupo, empresa, aplicación u oferta sea legítima o segura. Verifica siempre directamente en los portales oficiales.',
    singlePhraseNote:
      'Nota de contexto: La evidencia es limitada o se basa en una sola frase. Una sola frase sospechosa no demuestra fraude por sí sola.',
    emptyTitle: 'Listo para revisar un chat grupal',
    emptyBody:
      'Pega los mensajes a la izquierda (o elige un ejemplo) y selecciona "Usar solo verificación demo" o "Obtener revisión con Gemini IA".',
    copySummaryBtn: 'Copiar resumen',
    copiedSummaryBtn: 'Resumen copiado',
    section1SummaryTitle: 'Resumen de la conversación',
    section2StagesTitle: 'Posibles etapas',
    stagesIntro:
      'Estas 5 etapas describen patrones posibles, no un guion fijo. Un chat puede mostrar una, varias o ninguna.',
    stageSupportedBadge: 'Patrón observado en el chat',
    stageNotEnoughInfoBadge: 'Información insuficiente',
    stageNotEnoughInfoDesc: 'No hay suficiente información en los mensajes pegados.',
    section3WarningsTitle: 'Señales de alerta',
    warningSourceLabel: 'Mensaje de origen:',
    warningPhraseLabel: 'Frase de respaldo:',
    noWarningsBody: 'No se encontraron coincidencias con señales de alerta en el texto pegado.',
    section4UncheckedTitle: 'Qué no se pudo verificar',
    cannotVerifyDirectlyLabel: 'Esta aplicación no puede verificarlo directamente',
    section5NextStepsTitle: 'Próximos pasos',
    disclaimerNote:
      'Solo herramienta educativa de evaluación — no puede demostrar que una persona, grupo, empresa, oferta o mensaje sea legítimo o fraudulento. Nada se guarda.',
    messageNumberLabel: (n) => `Mensaje ${n}`,
    parsedSummaryLine: (count, hasSpeakers, hasDates) =>
      `Se revisaron ${count} ${count === 1 ? 'mensaje' : 'mensajes'}${
        !hasSpeakers && !hasDates
          ? ' (sin etiquetas de hablante ni fechas opcionales).'
          : ' con los detalles ingresados.'
      }`,
    topicCluesLine: (topics) => `Temas y solicitudes mencionados: ${topics}.`,
    stageTitles: {
      initial_offer: '1. Oferta inicial de inversión no solicitada o contacto en redes',
      trust_building:
        '2. Generación de confianza con supuesta experiencia, testimonios, capturas o actividad grupal',
      app_or_group_invite:
        '3. Invitación a usar una app de trading, sitio web, grupo privado o archivo APK',
      payment_or_recruiting_pressure:
        '4. Presión para invertir más, reclutar personas, pagar una comisión o actuar rápido',
      withdrawal_friction:
        '5. Dificultades para retirar dinero, cargos adicionales o pedidos de más pagos',
    },
    stageSupportedReason: {
      initial_offer:
        'Un mensaje presenta una oferta de grupo de inversión, cuota o promesa de ganancias que conviene verificar.',
      trust_building:
        'Los mensajes muestran capturas de ganancias, elogios o frases tranquilizadoras ("es seguro"). Las capturas en chats pueden ser editadas.',
      app_or_group_invite:
        'Se invita a pasar a un grupo privado o instalar una app externa o archivo .apk.',
      payment_or_recruiting_pressure:
        'Se presiona para pagar rápido, depositar más capital, invitar a otros o compartir códigos PIN/OTP.',
      withdrawal_friction:
        'Se mencionan retiros bloqueados o se exige pagar impuestos o cargos de desbloqueo antes de liberar dinero.',
    },
    warningExplanations: {
      secretRequest: {
        title: 'Solicitud de OTP, PIN, contraseña, CVV o acceso remoto',
        explanation:
          'Nunca compartas OTP, PIN de UPI/cajero, contraseñas o CVV. Los bancos y asesores legítimos nunca los piden.',
      },
      pinToReceive: {
        title: 'Afirma que se necesita PIN o QR para recibir dinero',
        explanation:
          'Ingresar tu PIN UPI o escanear un código QR siempre envía dinero hacia afuera, nunca para recibir pagos.',
      },
      guaranteedReturn: {
        title: 'Promesa de rendimientos garantizados o sin riesgo',
        explanation: 'Las inversiones bursátiles reguladas no pueden garantizar ganancias fijas.',
      },
      multiplierReturn: {
        title: 'Promesa de ganancias muy altas a corto plazo',
        explanation: 'Porcentajes altos en pocos días o meses son motivo para detenerse y verificar.',
      },
      urgencyPressure: {
        title: 'Urgencia o fecha límite para pagar rápido',
        explanation: 'Plazos como "solo hoy" presionan para pagar antes de comprobar registros oficiales.',
      },
      vipPitch: {
        title: 'Mención exclusiva de "mesa VIP", "operación en bloque" o "cuota pre-IPO"',
        explanation: 'Verifica directamente en SEBI si la firma está registrada antes de enviar dinero.',
      },
      offPlatformOrApk: {
        title: 'Invitación a grupo privado o descarga externa de app / .apk',
        explanation: 'Instalar apps fuera de tiendas oficiales expone tu teléfono y tus apps bancarias.',
      },
      upfrontOrWithdrawalFee: {
        title: 'Cobro previo, impuesto o tarifa para desbloquear retiros',
        explanation: 'Pagar tarifas adicionales para liberar supuestas ganancias es una señal grave para detenerse.',
      },
      testimonialOrProofHype: {
        title: 'Capturas de ganancias, testimonios o supuestas certificaciones',
        explanation: 'Las capturas y halagos en un grupo no prueban operaciones reales ni registro en SEBI.',
      },
      recruitmentPressure: {
        title: 'Presión para depositar más dinero o invitar a otras personas',
        explanation: 'Pedidos de sumar amigos por bonos o aumentar depósitos requieren verificación oficial.',
      },
      unverifiedReassurance: {
        title: 'Frases tranquilizadoras ("es seguro", "no es estafa", "no te preocupes")',
        explanation: 'Decir "es seguro" o "no es estafa" no demuestra legitimidad cuando va junto a cobros o promesas.',
      },
    },
    contextUnclearFallback:
      'El contexto puede estar incompleto en un fragmento corto; una frase aislada no demuestra fraude.',
    uncheckedItems: {
      noSebiId: 'No se verificó ningún número de registro SEBI en esta revisión.',
      noAppOrLink: 'No había detalles completos de sitio web o tienda oficial para revisar.',
      noPaymentHandle: 'No se confirmó nombre bancario del beneficiario ni verificación @valid.',
      noSpeakerOrDates: 'Las identidades y fechas son opcionales y no están confirmadas.',
      liveSebi:
        'Esta aplicación no puede verificarlo directamente: Registro SEBI en vivo (consulta investor.sebi.gov.in/Investor-support.html).',
      liveSebiCheck:
        'Esta aplicación no puede verificarlo directamente: Verificación en vivo de UPI, QR o cuenta bancaria (consulta siportal.sebi.gov.in/intermediary/sebi-check).',
      liveAppsAndDomain:
        'Esta aplicación no puede verificarlo directamente: Apps de trading autorizadas o seguridad de sitios/.apk (consulta investor.sebi.gov.in/Investor-support.html).',
    },
    nextStepsList: [
      'Detente antes de enviar dinero, abrir enlaces desconocidos o instalar apps o archivos .apk.',
      'Verifica el registro exacto y las apps autorizadas en investor.sebi.gov.in/Investor-support.html y revisa las guías oficiales de SEBI.',
      'Comprueba cualquier UPI ID, código QR o cuenta bancaria/IFSC en SEBI Check (siportal.sebi.gov.in/intermediary/sebi-check).',
      'Si ya enviaste dinero o compartiste claves, contacta a tu banco de inmediato y denuncia el fraude financiero al 1930 o en https://cybercrime.gov.in/.',
    ],
    presets: {
      'gc-multi-stage': {
        title: 'Oferta VIP por etapas y retención',
        subtitle: 'Oferta -> capturas -> app .apk -> urgencia -> impuesto de retiro',
      },
      'gc-protective-otp': {
        title: 'Aviso familiar de seguridad (OTP/PIN)',
        subtitle: 'Recuerda nunca compartir OTP/PIN ni apresurarse',
      },
      'gc-neutral-discuss': {
        title: 'Charla neutral sobre inversión',
        subtitle: 'Conversación normal sobre fondos índice y SEBI',
      },
      'gc-mixed-chat': {
        title: 'Chat mixto: consejo y oferta riesgosa',
        subtitle: 'Un miembro advierte sobre OTP y otro promete 20% mensual',
      },
    },
  },
  footer: {
    note: 'Investor Scam Check · Demo educativa · Herramienta educativa de prevención previa al pago; no constituye asesoría financiera ni legal.',
  },
  analyzer: {
    pitchGuaranteed:
      'Promete rendimientos garantizados o sin riesgo, algo que las inversiones bursátiles reguladas no pueden garantizar.',
    pitchMultiplier: 'Menciona porcentajes inusualmente altos a corto plazo o ganancias multiplicadas.',
    pitchUrgency: 'Usa presión de tiempo o urgencia para empujar un pago rápido antes de que puedas verificar.',
    pitchVip:
      'Emplea expresiones como "mesa VIP", "operación en bloque" o "cuota pre-IPO" frecuentes en ofertas sin verificar.',
    pitchGroupApp: 'Pide pasar a un grupo privado de chat o instalar una aplicación externa.',
    pitchFees: 'Menciona comisiones por adelantado, recargas de margen o cargos antes de liberar ganancias.',
    pitchSecretRequest:
      'Nunca compartas tu UPI PIN, ATM PIN, OTP, CVV o contraseña con nadie. Los asesores reales y los bancos nunca piden un PIN u OTP para verificar tu cuenta o liberar ganancias.',
    pitchPinToReceive:
      'Ingresar tu PIN de UPI o escanear un código QR siempre envía dinero hacia afuera — nunca necesitas PIN ni escanear un QR para recibir dinero, premios ni reembolsos.',
    msgNotProvidedLabel: 'No proporcionado',
    msgNotProvidedHeadline: 'No se ingresó ningún mensaje de inversión',
    msgNotProvidedDesc:
      'Pega el mensaje de WhatsApp, Telegram o SMS si lo tienes para buscar tácticas de presión o promesas de ganancias.',
    msgHighLabel: 'Se encontraron señales de advertencia',
    msgHighHeadline: 'Se encontraron señales de advertencia en el mensaje',
    msgSecretHeadline: 'El mensaje pide un PIN, OTP o contraseña — nunca los compartas',
    msgCautionLabel: 'Se encontraron señales de advertencia',
    msgCautionHeadline: 'Se menciona un grupo externo o una solicitud de tarifa',
    msgNoSignsLabel: 'No se encontraron señales de alerta listadas',
    msgNoSignsHeadline: 'No se encontraron señales de alerta listadas en el texto',
    msgNoSignsDesc:
      'Que no coincida con nuestras palabras clave listadas NO demuestra que este mensaje sea genuino ni seguro. Verifica siempre al remitente en sebi.gov.in.',
    sebiMissingLabel: 'No proporcionado',
    sebiMissingHeadline: 'No se ingresó registro SEBI ni empresa',
    sebiMissingDesc:
      'Campo opcional en blanco. Si alguien te pide invertir, puedes buscar asesores registrados directamente en investor.sebi.gov.in.',
    sebiMissingDemo: 'Revisión solo demo: la consulta en vivo del registro SEBI no está disponible aquí.',
    sebiValidLabel: 'No se pudo verificar — consulta directamente con SEBI',
    sebiValidHeadline: (id) => `El formato coincide con un ID de SEBI (${id}) — no verificado en vivo`,
    sebiValidDesc:
      'Cualquiera puede copiar un número real de registro de internet y comprobar el formato NO es una verificación en vivo. Además, el registro SEBI por sí solo no garantiza ganancias.',
    sebiValidDemo:
      'Solo demo: esta herramienta no se conecta a SEBI. Verifica el nombre exacto y el teléfono oficial en investor.sebi.gov.in.',
    sebiMismatchLabel: 'Se encontraron señales de advertencia',
    sebiMismatchHeadline: 'El registro declarado no sigue el formato estándar de un ID SEBI',
    sebiMismatchDesc:
      'Los números oficiales de SEBI suelen empezar por INA, INH, INZ, INP o INM seguidos de 9 dígitos. Comprueba el número exacto en el portal oficial de SEBI.',
    sebiNameOnlyLabel: 'No se pudo verificar — consulta directamente con SEBI',
    sebiNameOnlyHeadline: 'Se ingresó un nombre de entidad sin un número estándar de SEBI',
    sebiNameOnlyDesc:
      'El nombre por sí solo no confirma el registro y estar registrado en SEBI nunca garantiza rendimientos. Pide su código SEBI de 12 caracteres y verifícalo en investor.sebi.gov.in.',
    sebiCantVerifyDemo: 'Solo demo: los registros oficiales de SEBI en vivo no están conectados.',
    linkNotProvidedLabel: 'No proporcionado',
    linkNotProvidedHeadline: 'No se ingresó enlace web ni de app',
    linkNotProvidedDesc:
      'Si el mensaje incluye un sitio web, portal de acceso o enlace para descargar una app, pégalo aquí para buscar señales comunes de riesgo.',
    linkHighLabel: 'Se encontraron señales de advertencia',
    linkApkHeadline: 'Descarga directa de app (.apk) o enlace de instalación sin verificar',
    linkApkDesc:
      'Instalar apps financieras desde enlaces fuera de Google Play Store o Apple App Store puede exponer tu teléfono, códigos OTP por SMS y apps bancarias.',
    linkSpoofHeadline: 'Dominio imitado o dirección web con patrón inusual',
    linkSpoofDesc:
      'Esta dirección usa palabras de marca o mercado dentro de un dominio no oficial. Nunca tomes un nombre conocido o el candado HTTPS como prueba de seguridad — revisa las apps autorizadas en investor.sebi.gov.in/Investor-support.html.',
    linkDemoDomain: 'Revisión solo demo: la titularidad del dominio y el SSL en vivo no están disponibles aquí.',
    linkCautionLabel: 'Se encontraron señales de advertencia',
    linkShortenerHeadline: 'El enlace acortado o de redirección oculta el destino final',
    linkShortenerDesc:
      'Los enlaces acortados ocultan a qué página llegarás. Evita ingresar contraseñas, PAN o datos bancarios en páginas abiertas desde enlaces cortos.',
    linkHttpHeadline: 'El enlace usa http:// sin cifrar en lugar de https://',
    linkHttpDesc:
      'Los portales financieros deben usar https:// cifrado, aunque recuerda que HTTPS por sí solo solo cifra la conexión y nunca prueba que el sitio sea autorizado o seguro.',
    linkCantVerifyLabel: 'No verificado por esta demo',
    linkCantVerifyHeadline: (host) => `Dominio anotado (${host}) — no verificado por esta demo`,
    linkCantVerifyDesc:
      'Una dirección limpia, el candado HTTPS o una marca conocida NO prueban que una plataforma sea genuina ni segura. Verifica sitios y apps oficiales en investor.sebi.gov.in/Investor-support.html.',
    linkDemoReputation: 'Solo demo: la reputación web en vivo y consulta WHOIS no están disponibles.',
    payNotProvidedLabel: 'No proporcionado',
    payNotProvidedHeadline: 'No se ingresó ID de UPI, cuenta bancaria ni monto',
    payNotProvidedDesc:
      'Agrega el identificador UPI, cuenta bancaria o monto en ₹ solicitado. Nunca transfieras fondos de inversión a la cuenta personal de un individuo.',
    payHighLabel: 'Se encontraron señales de advertencia',
    payPersonalUpiHeadline: (upi) => `Identificador UPI de tipo personal (${upi}) para una propuesta de inversión`,
    payPersonalAccountHeadline: 'Transferencia solicitada a una cuenta individual o sin verificar',
    payPersonalDesc: (amountText) =>
      `Los intermediarios registrados en SEBI solo cobran mediante canales corporativos verificados o identificadores @valid de SEBI — no cuentas personales${
        amountText ? ` (en especial por ${amountText})` : ''
      }.`,
    payDemoLookup: 'Solo demo: la consulta en vivo del titular de UPI y SEBI Check no está disponible.',
    payCautionLabel: 'Se encontraron señales de advertencia',
    payLargeHeadline: (amount) =>
      `Revisión previa para ${amount} — verifica con cuidado el nombre y el monto`,
    payLargeDesc:
      'Antes de confirmar una transferencia de este monto, verifica en tu app bancaria que el nombre del beneficiario coincida exactamente con la empresa registrada y confirma el monto exacto en ₹.',
    payDemoBank: 'Solo demo: la verificación bancaria / NPCI en vivo no está disponible.',
    payValidUpiLabel: 'No se pudo verificar — consulta directamente con SEBI',
    payValidUpiHeadline: (upi) => `Identificador @valid estilo SEBI (${upi}) — verifica en SEBI Check`,
    payValidUpiDesc:
      'Los identificadores terminados en @valid están pensados para entidades registradas en SEBI, pero esta demo no puede confirmar su validez o titularidad en vivo. Verifica directamente en SEBI Check (siportal.sebi.gov.in/intermediary/sebi-check) antes de pagar.',
    payNonValidUpiHeadline: (upi) => `Identificador UPI sin @valid (${upi}) — verifica en SEBI Check antes de pagar`,
    payNonValidUpiDesc:
      'Este identificador no aparece como un identificador @valid validado por SEBI en esta demo. No se clasifica como personal solo por su sufijo, pero debes verificarlo directamente en SEBI Check (siportal.sebi.gov.in/intermediary/sebi-check) antes de pagar.',
    payAmountContextHeadline: (amount) =>
      `Solicitud de ${amount} — verifica junto con las demás señales de advertencia`,
    payAmountContextDesc:
      'El monto por sí solo no demuestra riesgo. Como existen otras señales independientes de advertencia, confirma el nombre del beneficiario, registro SEBI y vía oficial por separado antes de ingresar tu PIN.',
    payCantVerifyLabel: 'No verificado por esta demo',
    payCantVerifyHeadline: 'Identificador de pago anotado — titular no verificado por esta demo',
    payCantVerifyDesc:
      'Un monto o proveedor de UPI por sí solo no demuestra riesgo, pero esta demo no puede verificar al titular en vivo. Confirma el nombre exacto del beneficiario y el monto en ₹ dentro de tu app bancaria antes de ingresar tu PIN.',
    payDemoNotConnected: 'Solo demo: la verificación en vivo de UPI / cuenta bancaria no está conectada.',
    unifiedEmptyTitle: 'Ingresa al menos un detalle para comenzar',
    unifiedEmptySummary:
      'Pega el mensaje, número SEBI declarado, enlace web o solicitud de pago/UPI — o elige uno de los ejemplos realistas arriba.',
    unifiedEmptyInsight:
      'Conectar las cuatro piezas ayuda a revelar incoherencias que una revisión aislada podría pasar por alto.',
    unifiedEmptyStep: 'Pega los detalles que hayas recibido antes de abrir tu app de pagos.',
    unifiedEmptyDemo: 'Evaluación solo demo: no se realizan consultas en vivo de SEBI, dominios ni UPI.',
    unifiedHighTitle: 'Se encontraron señales de advertencia — detente antes de enviar dinero',
    unifiedHighSummary: (highCount, cautionCount) =>
      `Detectamos señales de advertencia en ${highCount + cautionCount} ${
        highCount + cautionCount === 1 ? 'parte' : 'partes'
      } de los detalles compartidos. No transfieras fondos hasta verificar cada dato por canales oficiales.`,
    unifiedCautionTitle: 'Se encontraron señales de advertencia — verifica antes de enviar dinero',
    unifiedCautionSummary:
      'Algunos datos activaron señales de advertencia que requieren verificación independiente antes de pagar. Confirma siempre el registro y la identidad del destinatario.',
    unifiedCantVerifyTitle: 'No se encontraron señales de alerta listadas — consulta portales oficiales',
    unifiedCantVerifySummary:
      'Las reglas de demostración no encontraron señales de alerta listadas, pero esto NO demuestra que el mensaje, la oferta o el destinatario sean genuinos ni seguros. Verifica siempre directamente con SEBI y tu app bancaria.',
    insightPitchPay: (amountText) =>
      `Inconsistencia conectada: el mensaje promete altas ganancias o urgencia y el pago${
        amountText ? ` (${amountText})` : ''
      } se dirige a una cuenta bancaria/personal sin verificar o una vía sin @valid.`,
    insightPitchUnverifiedPay: (amountText) =>
      `Verifica junto al mensaje: el mensaje contiene señales de advertencia y el dato de pago${
        amountText ? ` (${amountText})` : ''
      } no está verificado en esta demo. Compruébalo en SEBI Check y tu app bancaria antes de pagar.`,
    insightLink:
      'Inconsistencia conectada: una propuesta de inversión combinada con un enlace web imitado o una descarga directa .apk suele eludir las apps oficiales de brókeres y la protección al inversor.',
    insightSebiPay: (sebiId, amountText) =>
      `Inconsistencia conectada: se cita un código estilo SEBI (${sebiId}), pero el destino del pago${
        amountText ? ` (${amountText})` : ''
      } no corresponde a un canal corporativo o validado por SEBI.`,
    insightGeneralGap:
      'Revisión conectada: al analizar juntos el mensaje, el registro, el enlace y el pago, cualquier vacío o urgencia en una sola parte es motivo sólido para detenerse.',
    insightUnconfirmed:
      'Revisión conectada: las reglas de demostración detectaron pocas señales. Como los registros reales de SEBI y UPI no están conectados aquí, trata todo dato no comprobado como sin confirmar.',
    unifiedNextSteps: [
      'Haz una pausa antes de pagar: no envíes dinero de inmediato, aunque te digan que el "cupo", "cuota IPO" u "oferta" vence hoy.',
      'Verifica en SEBI directamente: entra tú mismo a investor.sebi.gov.in/Investor-support.html y comprueba número de registro, empresa, contacto y app autorizada. Recuerda que estar registrado nunca garantiza ganancias.',
      'Comprueba destinatario y @valid: verifica UPI, QR o cuenta/IFSC en SEBI Check (siportal.sebi.gov.in) y confirma el nombre exacto y monto en ₹ en tu app antes de poner tu PIN.',
      'Usa la vía correcta para denunciar: usa SCORES (scores.sebi.gov.in) solo para entidades registradas en SEBI. Ante fraude cibernético, UPI o bancario, avisa a tu banco de inmediato, llama al 1930 y denuncia en cybercrime.gov.in.',
    ],
    unifiedDemoLimit:
      'Revisión solo demo: aplica reglas transparentes sobre el texto ingresado. No consulta sistemas reales de SEBI, dominios ni NPCI/UPI y nunca garantiza seguridad.',
    payCheckEmptyTitle: 'Ingresa detalles de pago para revisar',
    payCheckEmptySummary:
      'Ingresa el ID de UPI, cuenta bancaria o monto que estás por pagar — o elige un ejemplo realista arriba.',
    payCheckEmptyDemo: 'Revisión solo demo: no verifica cuentas bancarias ni IDs de UPI en tiempo real.',
    payFindingNameDiffTitle: 'El titular de la cuenta no coincide con la empresa declarada',
    payFindingNameDiffDesc:
      'Si una plataforma de inversión o asesor te pide pagar a nombre de una persona sin relación o de otro negocio distinto, detente de inmediato.',
    payFindingNameUnsureTitle: 'El nombre del beneficiario aún no ha sido confirmado',
    payFindingNameUnsureDesc:
      'Antes de ingresar tu PIN o contraseña, revisa el nombre bancario verificado y el monto exacto en ₹ que aparece en tu pantalla.',
    payFindingNonValidUpiTitle: (suffix) =>
      `El identificador UPI (@${suffix}) no figura como @valid de SEBI en esta demo`,
    payFindingNonValidUpiDesc:
      'Este identificador no se muestra como un identificador @valid validado por SEBI en esta demo. Compruébalo directamente en SEBI Check (siportal.sebi.gov.in/intermediary/sebi-check) antes de pagar. Esta demo no lo clasifica como personal por su sufijo.',
    payFindingValidUpiTitle: 'Formato @valid anotado — aun así debe verificarse en SEBI Check',
    payFindingValidUpiDesc:
      'Tener "@valid" en texto NO prueba validez ni titularidad en vivo. Verifica este identificador exacto en SEBI Check (siportal.sebi.gov.in/intermediary/sebi-check) y confirma nombre y monto en tu app.',
    payFindingUpiFormatTitle: 'El formato del ID de UPI parece incompleto',
    payFindingUpiFormatDesc:
      'Un ID de UPI estándar incluye el símbolo "@" (por ejemplo, nombre@banco). Vuelve a comprobar quién te dio este identificador.',
    payFindingQrTitle: 'Los códigos QR o enlaces de pago por chat ocultan los datos hasta escanear',
    payFindingQrDesc:
      'Nunca escanees un código QR enviado por chat para "recibir" un reembolso o ganancia — escanear un QR e ingresar tu PIN siempre envía dinero hacia afuera.',
    payFindingBankTitle: 'Transferencia IMPS/NEFT directa pedida fuera de una app oficial de trading',
    payFindingBankDesc:
      'Los brókeres regulados reciben fondos mediante pasarelas vinculadas a bolsa dentro de su app o sitio oficial — no mediante números de cuenta compartidos por chat.',
    payFindingSourceTitle: 'Pago solicitado a través de WhatsApp o Telegram',
    payFindingSourceDesc:
      'Las solicitudes para transferir dinero de inversión desde grupos de chat son un indicador frecuente de suplantación o esquemas no autorizados.',
    payFindingAmountTitle: (amount) => `Monto ingresado (${amount}) — contexto neutral`,
    payFindingAmountDesc:
      'El monto por sí solo no demuestra riesgo. Confirma el nombre exacto del destinatario y el propósito en tu app bancaria antes de ingresar tu PIN.',
    payFindingAmountContextTitle: (amount) => `Monto solicitado (${amount}) — contexto con otras señales`,
    payFindingAmountContextDesc:
      'El monto no es una advertencia por sí mismo, pero combinado con otras señales de alerta refuerza la necesidad de verificar antes de transferir.',
    payFindingLiveTitle: 'No verificado por esta demo: titular real o estado en SEBI Check',
    payFindingLiveDesc:
      'Esta herramienta no puede consultar NPCI, bancos ni SEBI Check en vivo. Considera la falta de alertas aquí como "sin verificar", nunca como "seguro".',
    payCheckHighTitle: 'Se encontraron señales de advertencia — no toques Pagar todavía',
    payCheckHighSummary:
      'La combinación de método de pago, origen o nombre del destinatario muestra señales de advertencia. Detente y verifica por canales oficiales.',
    payCheckCautionTitle: 'Se encontraron señales de advertencia — confirma beneficiario y monto antes de pagar',
    payCheckCautionSummary:
      'Revisa cada punto de la lista previa al pago antes de ingresar tu PIN de UPI o clave bancaria.',
    payCheckCantVerifyTitle: 'No se encontraron señales de alerta listadas — verifica oficialmente',
    payCheckCantVerifySummary:
      'Las reglas de demostración no encontraron señales de alerta listadas, lo que NO demuestra que esta solicitud de pago sea genuina ni segura. Confirma el nombre exacto y monto en tu app del banco.',
    payCheckChecklist: [
      '¿Tu app del banco/UPI muestra exactamente el nombre registrado de la empresa y el monto exacto en ₹ que deseas pagar?',
      '¿Estás pagando dentro de una app o web oficial del bróker listada en investor.sebi.gov.in/Investor-support.html (y no desde un enlace de chat)?',
      '¿Verificaste el número SEBI de la firma en investor.sebi.gov.in y sus datos UPI/QR/bancarios en SEBI Check?',
      'Recuerda: ingresar tu PIN de UPI o escanear un QR solo envía dinero — nunca es necesario para recibir ganancias ni reembolsos.',
    ],
    payCheckDemoLimit:
      'Revisión solo demo: la consulta bancaria de beneficiarios, verificación NPCI VPA y SEBI Check en vivo no están disponibles en esta demo.',
  },
};
