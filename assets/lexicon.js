(function(){
  // EDIT ME: one entry per category. `key` is the internal id (used in SEED
  // below), `code` is the 3-4 letter chip shown in the rail, `label` is the
  // bilingual display name, `color` is a pastel hex used for that
  // category's text/chip/active-state everywhere in the rail. Add or
  // remove categories freely — everything else adapts automatically.
  var CATEGORIES = [
    { key:"foundations", code:"NN",  label:{en:"Neural Network Foundations", es:"Fundamentos de Redes Neuronales"}, color:"#7fa8e8" },
    { key:"llm",         code:"LLM", label:{en:"LLMs & Language", es:"LLMs y Lenguaje"}, color:"#6dbcae" },
    { key:"training",    code:"TRN", label:{en:"Training & Evaluation", es:"Entrenamiento y Evaluación"}, color:"#e08bad" },
    { key:"agents",      code:"AGT", label:{en:"Agentic Systems & Reasoning", es:"Sistemas Agénticos y Razonamiento"}, color:"#dba374" },
    { key:"memory",      code:"MEM", label:{en:"Memory, Retrieval & Tools", es:"Memoria, Recuperación y Herramientas"}, color:"#b19ce0" },
    { key:"safety",      code:"SAF", label:{en:"Guardrails & Governance", es:"Guardrails y Gobernanza"}, color:"#8fc48a" },
    { key:"voice",       code:"VOI", label:{en:"Voice & Multimodal AI", es:"IA de Voz y Multimodal"}, color:"#e0c26e" }
  ];

  var STRINGS = {
    en: {
      subtitle: "Dante's AI Glossary — indexed by use, alphabet, and tag.",
      sourcesNote: "Built from my own course notes — every definition cites MIT, Harvard, or O'Reilly by name as its source.",
      browseLabel: "Browse",
      categoriesLabel: "Categories",
      newEntry: "+ New entry",
      storageNote: "Edits are saved in this browser only.",
      storageNotePublic: "Reference glossary — every visitor sees the same 63 definitions.",
      emptyStatePublic: "Nothing matches yet. Try a different search.",
      homeLink: "Monkyfi home →",
      editModeBadge: "Editor",
      searchPlaceholder: "Search terms, definitions, or tags…",
      viewCategory: "By category",
      viewAlpha: "Alphabetical",
      viewTags: "By tag",
      allEntries: "All entries",
      allTags: "All tags",
      alphaIndexTitle: "Alphabetical index",
      entrySingular: "entry",
      entryPlural: "entries",
      emptyState: "Nothing matches yet. Try a different search, or add a new entry.",
      modalNewTitle: "New entry",
      modalEditTitle: "Edit entry",
      fieldTerm: "Term",
      fieldTermPlaceholder: "e.g. Retrieval-Augmented Generation",
      fieldCategory: "Category",
      fieldTags: "Tags",
      fieldTagsPlaceholder: "comma, separated",
      fieldUsecase: "One-line definition",
      fieldUsecasePlaceholder: "Plain-language, one sentence",
      fieldPrompt: "Full explanation",
      fieldPromptPlaceholder: "Longer explanation, example, or notes…",
      cancel: "Cancel",
      saveEntry: "Save entry",
      requiredStatus: "term & explanation required",
      unsavedStatus: "Unsaved changes",
      saveNowBtn: "Save",
      savingStatus: "saving…",
      savedStatus: "saved",
      notSavedStatus: "not saved — ",
      copy: "Copy",
      copied: "Copied ✓",
      edit: "Edit",
      del: "Delete",
      deleteConfirm: "Delete this entry permanently?",
      deleteYes: "Delete",
      deleteNo: "Cancel",
      dragToReorder: "Drag to reorder",
      refreshBtn: "Refresh",
      langToggle: "Español",
      allTag: "ALL"
    },
    es: {
      subtitle: "Glosario de IA de Dante — indexada por uso, alfabeto y etiqueta.",
      sourcesNote: "Hecho a partir de mis propios apuntes de curso — cada definición cita por nombre a MIT, Harvard u O'Reilly como su fuente.",
      browseLabel: "Explorar",
      categoriesLabel: "Categorías",
      newEntry: "+ Nueva entrada",
      storageNote: "Los cambios se guardan solo en este navegador.",
      storageNotePublic: "Glosario de referencia — todos los visitantes ven las mismas 63 definiciones.",
      emptyStatePublic: "Nada coincide todavía. Prueba otra búsqueda.",
      homeLink: "Inicio Monkyfi →",
      editModeBadge: "Editor",
      searchPlaceholder: "Buscar términos, definiciones o etiquetas…",
      viewCategory: "Por categoría",
      viewAlpha: "Alfabético",
      viewTags: "Por etiqueta",
      allEntries: "Todas las entradas",
      allTags: "Todas las etiquetas",
      alphaIndexTitle: "Índice alfabético",
      entrySingular: "entrada",
      entryPlural: "entradas",
      emptyState: "Nada coincide todavía. Prueba otra búsqueda, o agrega una nueva entrada.",
      modalNewTitle: "Nueva entrada",
      modalEditTitle: "Editar entrada",
      fieldTerm: "Término",
      fieldTermPlaceholder: "p. ej. Generación Aumentada por Recuperación",
      fieldCategory: "Categoría",
      fieldTags: "Etiquetas",
      fieldTagsPlaceholder: "separadas por comas",
      fieldUsecase: "Definición en una línea",
      fieldUsecasePlaceholder: "En lenguaje simple, una oración",
      fieldPrompt: "Explicación completa",
      fieldPromptPlaceholder: "Explicación más larga, ejemplo o notas…",
      cancel: "Cancelar",
      saveEntry: "Guardar entrada",
      requiredStatus: "término y explicación son obligatorios",
      unsavedStatus: "Cambios sin guardar",
      saveNowBtn: "Guardar",
      savingStatus: "guardando…",
      savedStatus: "guardado",
      notSavedStatus: "no guardado — ",
      copy: "Copiar",
      copied: "Copiado ✓",
      edit: "Editar",
      del: "Eliminar",
      deleteConfirm: "¿Eliminar esta entrada permanentemente?",
      deleteYes: "Eliminar",
      deleteNo: "Cancelar",
      dragToReorder: "Arrastra para reordenar",
      refreshBtn: "Actualizar",
      langToggle: "English",
      allTag: "TODO"
    }
  };

  // EDIT ME: replace with your own entries. `cat` must match a CATEGORIES
  // key above. `usecase` is the one-line definition shown collapsed;
  // `prompt` is the full explanation/example shown when expanded (it
  // supports the same optional structured formats as the original — see
  // formatPromptHTML below — but plain prose works fine too).
  var SEED = [
    // ---------- Neural Network Foundations ----------
    {term:"Neural Network", cat:"foundations", tags:["fundamentals","mit"],
     usecase:"A computational model inspired by the brain that learns patterns from data.",
     prompt:"A computational model inspired by biological neural networks in the human brain. Artificial neural networks are trained on data to learn patterns and relationships, making them the fundamental building block of machine learning and deep learning applications — from a simple classifier to a full Large Language Model.\n\nSource: MIT Agentic AI, Module 1 Glossary.",
     usecase_es:"Un modelo computacional inspirado en el cerebro que aprende patrones a partir de datos.",
     prompt_es:"Un modelo computacional inspirado en las redes neuronales biológicas del cerebro humano. Las redes neuronales artificiales se entrenan con datos para aprender patrones y relaciones, lo que las convierte en el bloque de construcción fundamental del machine learning y las aplicaciones de deep learning — desde un clasificador simple hasta un Large Language Model completo.\n\nFuente: MIT Agentic AI, Glosario del Módulo 1."},

    {term:"Transformer Architecture", cat:"foundations", tags:["architecture","attention","mit"],
     usecase:"The deep learning architecture — built on self-attention — behind virtually all modern LLMs.",
     prompt:"A deep learning model that uses self-attention mechanisms to process and generate sequential data, such as language, more efficiently and effectively than previous architectures (like RNNs). A Transformer Model is a specific implementation of this architecture, used for tasks like translation, text generation, and other NLP work — it's the foundation GPT, Claude, Gemini, and Llama are all built on.\n\nSource: MIT Agentic AI, Module 1 Glossary.",
     usecase_es:"La arquitectura de deep learning — basada en auto-atención — detrás de prácticamente todos los LLMs modernos.",
     prompt_es:"Un modelo de deep learning que usa mecanismos de auto-atención (self-attention) para procesar y generar datos secuenciales, como el lenguaje, de forma más eficiente y efectiva que arquitecturas anteriores (como las RNN). Un Transformer Model es una implementación específica de esta arquitectura, usada para tareas como traducción, generación de texto y otras tareas de NLP — es la base sobre la que están construidos GPT, Claude, Gemini y Llama.\n\nFuente: MIT Agentic AI, Glosario del Módulo 1."},

    {term:"Encoder / Decoder", cat:"foundations", tags:["architecture","mit"],
     usecase:"The two halves of many sequence models: one reads input, the other writes output.",
     prompt:"The Encoder is the component that processes input data and transforms it into an internal representation (embedding), capturing the essential information in the input sequence. The Decoder is the component that generates an output sequence based on that encoded information — it follows the encoder and is often used in tasks like language translation or sequence generation.\n\nSource: MIT Agentic AI, Module 1 Glossary.",
     usecase_es:"Las dos mitades de muchos modelos de secuencia: una lee la entrada, la otra escribe la salida.",
     prompt_es:"El Encoder (codificador) es el componente que procesa los datos de entrada y los transforma en una representación interna (embedding), capturando la información esencial de la secuencia de entrada. El Decoder (decodificador) es el componente que genera una secuencia de salida a partir de esa información codificada — va después del encoder y se usa habitualmente en tareas como traducción de idiomas o generación de secuencias.\n\nFuente: MIT Agentic AI, Glosario del Módulo 1."},

    {term:"Backpropagation", cat:"foundations", tags:["training","mit"],
     usecase:"The core algorithm neural networks use to learn from their mistakes.",
     prompt:"An optimization algorithm used in training neural networks. It calculates the gradient of the loss function with respect to the model's parameters (weights), then uses that information to update the parameters — improving the model's performance over successive training iterations.\n\nSource: MIT Agentic AI, Module 1 Glossary.",
     usecase_es:"El algoritmo central que usan las redes neuronales para aprender de sus errores.",
     prompt_es:"Un algoritmo de optimización usado para entrenar redes neuronales. Calcula el gradiente de la función de pérdida respecto a los parámetros del modelo (los pesos), y usa esa información para actualizarlos — mejorando el desempeño del modelo a lo largo de iteraciones sucesivas de entrenamiento.\n\nFuente: MIT Agentic AI, Glosario del Módulo 1."},

    {term:"Activation Function", cat:"foundations", tags:["fundamentals","mit"],
     usecase:"The math that lets a neural network model complex, non-linear patterns.",
     prompt:"Introduces non-linearity into a neural network, allowing it to model complex patterns rather than only straight-line relationships. It helps a neuron 'decide' whether it should activate as it processes and passes along its output.\n\nSource: MIT Agentic AI, Module 1 Glossary.",
     usecase_es:"La matemática que permite a una red neuronal modelar patrones complejos y no lineales.",
     prompt_es:"Introduce no linealidad en una red neuronal, permitiéndole modelar patrones complejos en lugar de solo relaciones lineales. Ayuda a que una neurona 'decida' si debe activarse mientras procesa y transmite su salida.\n\nFuente: MIT Agentic AI, Glosario del Módulo 1."},

    {term:"Embeddings & Vectors", cat:"foundations", tags:["representation","mit"],
     usecase:"Numerical representations of words or concepts, positioned so similar meanings sit close together.",
     prompt:"An embedding is a mathematical representation of objects — often words or tokens — in a vector space, capturing semantic relationships so a model can process meaning rather than just symbols. Word vectors (word embeddings) encode semantic similarity: similar words sit close to each other in that space. Vectors themselves are just mathematical representations of data in multi-dimensional space; in neural networks they're the common currency for representing tokens.\n\nSource: MIT Agentic AI, Module 1 Glossary.",
     usecase_es:"Representaciones numéricas de palabras o conceptos, ubicadas de forma que los significados similares queden cerca entre sí.",
     prompt_es:"Un embedding es una representación matemática de objetos — a menudo palabras o tokens — en un espacio vectorial, que captura relaciones semánticas para que un modelo pueda procesar significado y no solo símbolos. Los word vectors (embeddings de palabras) codifican similitud semántica: palabras similares quedan cerca entre sí en ese espacio. Los vectores en sí son simplemente representaciones matemáticas de datos en un espacio multidimensional; en las redes neuronales son la 'moneda común' para representar tokens.\n\nFuente: MIT Agentic AI, Glosario del Módulo 1."},

    {term:"Weights", cat:"foundations", tags:["fundamentals","mit"],
     usecase:"The learned parameters that determine how strongly connections matter in a network.",
     prompt:"The parameters within a neural network that determine the strength of the connection between neurons, adjusted during training via backpropagation. A weight determines how important a given input is relative to the rest of the network's inputs.\n\nSource: MIT Agentic AI, Module 1 Glossary.",
     usecase_es:"Los parámetros aprendidos que determinan cuánto importa cada conexión dentro de una red.",
     prompt_es:"Los parámetros dentro de una red neuronal que determinan la fuerza de la conexión entre neuronas, y que se ajustan durante el entrenamiento mediante backpropagation. Un peso (weight) determina qué tan importante es una entrada dada en relación con el resto de las entradas de la red.\n\nFuente: MIT Agentic AI, Glosario del Módulo 1."},

    {term:"Generative Adversarial Network (GAN)", cat:"foundations", tags:["generative","mit"],
     usecase:"Two competing neural networks that together learn to generate realistic data.",
     prompt:"A class of machine learning frameworks where two neural networks — a generator and a discriminator — are trained simultaneously through an adversarial process, with the generator trying to produce data realistic enough to fool the discriminator. Related: Variational Autoencoders (VAEs), which learn to encode input data and create new samples from it, and Stable Diffusion models, which refine random noise into high-quality images.\n\nSource: MIT Agentic AI, Module 1 Glossary.",
     usecase_es:"Dos redes neuronales que compiten entre sí y juntas aprenden a generar datos realistas.",
     prompt_es:"Una familia de frameworks de machine learning en la que dos redes neuronales — un generador y un discriminador — se entrenan simultáneamente mediante un proceso adversarial, donde el generador intenta producir datos lo suficientemente realistas como para engañar al discriminador. Relacionados: los Variational Autoencoders (VAEs), que aprenden a codificar datos de entrada y crear nuevas muestras a partir de ellos, y los modelos de Stable Diffusion, que refinan ruido aleatorio hasta obtener imágenes de alta calidad.\n\nFuente: MIT Agentic AI, Glosario del Módulo 1."},

    {term:"Neural Network Layers", cat:"foundations", tags:["architecture","harvard"],
     usecase:"The input, hidden, and output stages data passes through in a network.",
     prompt:"There are three types of layers in a neural network: the Input layer, which takes in the initial data; the Hidden layer(s), the intermediate layer(s) between input and output where the actual computation happens; and the Output layer, which produces the final result for the given inputs.\n\nSource: MIT Agentic AI, Module 2 Glossary.",
     usecase_es:"Las etapas de entrada, ocultas y de salida por las que pasan los datos dentro de una red.",
     prompt_es:"Hay tres tipos de capas en una red neuronal: la capa de Entrada (Input), que recibe los datos iniciales; la(s) capa(s) Oculta(s) (Hidden), la(s) capa(s) intermedia(s) entre la entrada y la salida donde ocurre el cómputo real; y la capa de Salida (Output), que produce el resultado final para las entradas dadas.\n\nFuente: MIT Agentic AI, Glosario del Módulo 2."},

    // ---------- LLMs & Language ----------
    {term:"Large Language Model (LLM)", cat:"llm", tags:["fundamentals","mit"],
     usecase:"A powerful model trained to understand and generate human-like text.",
     prompt:"Powerful machine learning models designed to understand and generate human-like text, typically built on the Transformer architecture. Examples include GPT-3 and GPT-4 (Generative Pre-trained Transformer). Their capability comes from being pretrained on huge text corpora and then often fine-tuned for specific language tasks.\n\nSource: MIT Agentic AI, Module 1 Glossary.",
     usecase_es:"Un modelo potente entrenado para entender y generar texto de forma similar a un humano.",
     prompt_es:"Modelos de machine learning potentes diseñados para entender y generar texto de forma similar a un humano, típicamente construidos sobre la arquitectura Transformer. Ejemplos: GPT-3 y GPT-4 (Generative Pre-trained Transformer). Su capacidad viene de haber sido preentrenados en corpus de texto enormes y luego, a menudo, ajustados (fine-tuned) para tareas de lenguaje específicas.\n\nFuente: MIT Agentic AI, Glosario del Módulo 1."},

    {term:"Generative Pre-trained Transformer (GPT)", cat:"llm", tags:["models","mit"],
     usecase:"A Transformer model pretrained on a large text corpus and fine-tuned for language tasks.",
     prompt:"A type of Transformer-based model pretrained on a large corpus of text data and fine-tuned for various language tasks, known for its ability to generate coherent and contextually relevant text.\n\nSource: MIT Agentic AI, Module 1 Glossary.",
     usecase_es:"Un modelo Transformer preentrenado sobre un gran corpus de texto y ajustado para tareas de lenguaje.",
     prompt_es:"Un tipo de modelo basado en Transformer, preentrenado sobre un gran corpus de datos textuales y ajustado (fine-tuned) para diversas tareas de lenguaje, conocido por su capacidad de generar texto coherente y relevante al contexto.\n\nFuente: MIT Agentic AI, Glosario del Módulo 1."},

    {term:"Tokens", cat:"llm", tags:["fundamentals","mit"],
     usecase:"The basic units of text an LLM reads and writes — pieces of words, not whole sentences.",
     prompt:"A unit of input or output data representing a single element of a sequence. For LLMs like GPT-3 or GPT-4, a token can be as short as one character or as long as one word. Token count drives both cost and how much text a model can process at once (see LLM Context Length).\n\nSource: MIT Agentic AI, Module 1 Glossary.",
     usecase_es:"Las unidades básicas de texto que un LLM lee y escribe — fragmentos de palabras, no oraciones completas.",
     prompt_es:"Una unidad de datos de entrada o salida que representa un solo elemento de una secuencia. Para LLMs como GPT-3 o GPT-4, un token puede ser tan corto como un carácter o tan largo como una palabra. La cantidad de tokens determina tanto el costo como cuánto texto puede procesar un modelo a la vez (ver LLM Context Length).\n\nFuente: MIT Agentic AI, Glosario del Módulo 1."},

    {term:"Natural Language Processing (NLP)", cat:"llm", tags:["fundamentals","mit"],
     usecase:"The AI field focused on computers understanding and working with human language.",
     prompt:"A field of artificial intelligence that focuses on the interaction between computers and human languages — the umbrella discipline that modern LLMs sit within, alongside older techniques like keyword and rule-based text processing.\n\nSource: MIT Agentic AI, Module 1 Glossary.",
     usecase_es:"El campo de la IA enfocado en que las computadoras entiendan y trabajen con el lenguaje humano.",
     prompt_es:"Un campo de la inteligencia artificial enfocado en la interacción entre computadoras y lenguajes humanos — la disciplina general dentro de la cual se ubican los LLMs modernos, junto a técnicas más antiguas como el procesamiento de texto basado en palabras clave o reglas.\n\nFuente: MIT Agentic AI, Glosario del Módulo 1."},

    {term:"In-Context Learning", cat:"llm", tags:["prompting","mit"],
     usecase:"A model adapting its answers based on examples or context given in the prompt itself.",
     prompt:"The ability of a model to understand and generate responses based on the specific context provided by the user in the prompt — without any retraining or weight updates. Show the model a couple of examples of the pattern you want, and it 'learns' the pattern for that conversation only.\n\nSource: MIT Agentic AI, Module 2 Glossary.",
     usecase_es:"Un modelo que adapta sus respuestas según los ejemplos o el contexto dados en el propio prompt.",
     prompt_es:"La capacidad de un modelo para entender y generar respuestas basadas en el contexto específico que el usuario proporciona en el prompt — sin ningún reentrenamiento ni actualización de pesos. Muéstrale al modelo un par de ejemplos del patrón que quieres, y 'aprende' ese patrón solo para esa conversación.\n\nFuente: MIT Agentic AI, Glosario del Módulo 2."},

    {term:"System Prompt vs. User Prompt", cat:"llm", tags:["prompting","mit"],
     usecase:"The two layers of instruction that shape how a model responds.",
     prompt:"The System Prompt provides instructions on the broad task the model is being used for — its role, tone, and constraints, usually set by the developer or app. The User Prompt provides the specific instructions for the model to carry out within that broader task — what the person actually typed.\n\nSource: MIT Agentic AI, Module 2 Glossary.",
     usecase_es:"Las dos capas de instrucción que definen cómo responde un modelo.",
     prompt_es:"El System Prompt da instrucciones sobre la tarea general para la que se está usando el modelo — su rol, tono y restricciones, normalmente definidos por el desarrollador o la aplicación. El User Prompt da las instrucciones específicas que el modelo debe ejecutar dentro de esa tarea más amplia — lo que la persona realmente escribió.\n\nFuente: MIT Agentic AI, Glosario del Módulo 2."},

    {term:"LLM Context Length", cat:"llm", tags:["infrastructure","mit"],
     usecase:"How much text an AI model can 'hold in mind' at once.",
     prompt:"Refers to the amount of text that an AI model can process and retain in its allocated working memory during a single interaction. Everything beyond the context window — prior conversation, documents, tool outputs — has to be truncated, summarized, or handled through external memory.\n\nSource: MIT Agentic AI, Module 6 Glossary.",
     usecase_es:"Cuánto texto puede 'tener en mente' un modelo de IA a la vez.",
     prompt_es:"Se refiere a la cantidad de texto que un modelo de IA puede procesar y retener en su memoria de trabajo asignada durante una sola interacción. Todo lo que exceda la ventana de contexto — conversación previa, documentos, resultados de herramientas — debe truncarse, resumirse o manejarse mediante memoria externa.\n\nFuente: MIT Agentic AI, Glosario del Módulo 6."},

    {term:"Prompt Analysis", cat:"llm", tags:["prompting","mit"],
     usecase:"Examining an input prompt to understand what response it's likely to produce.",
     prompt:"The process of examining and understanding the input prompt provided to an AI model, to generate relevant and coherent responses or outputs — essentially debugging or reviewing a prompt before or after it's run.\n\nSource: MIT Agentic AI, Module 3 Glossary.",
     usecase_es:"Examinar un prompt de entrada para entender qué respuesta es probable que produzca.",
     prompt_es:"El proceso de examinar y entender el prompt de entrada dado a un modelo de IA, con el fin de generar respuestas o resultados relevantes y coherentes — en esencia, depurar o revisar un prompt antes o después de ejecutarlo.\n\nFuente: MIT Agentic AI, Glosario del Módulo 3."},

    // ---------- Training & Evaluation ----------
    {term:"Supervised Learning", cat:"training", tags:["training","mit"],
     usecase:"Training a model on labeled examples so it learns to predict the right answer.",
     prompt:"A category of machine learning that uses labeled datasets — inputs paired with known correct outputs — to train algorithms to predict outcomes and recognize patterns.\n\nSource: MIT Agentic AI, Module 2 Glossary.",
     usecase_es:"Entrenar un modelo con ejemplos etiquetados para que aprenda a predecir la respuesta correcta.",
     prompt_es:"Una categoría de machine learning que usa conjuntos de datos etiquetados — entradas emparejadas con salidas correctas conocidas — para entrenar algoritmos que predigan resultados y reconozcan patrones.\n\nFuente: MIT Agentic AI, Glosario del Módulo 2."},

    {term:"Reinforcement Learning from Human Feedback (RLHF)", cat:"training", tags:["training","alignment","mit"],
     usecase:"Using human feedback to steer a model toward more helpful, preferred answers.",
     prompt:"A machine learning technique that uses human feedback — people ranking or rating model outputs — to improve a model so it learns more efficiently and aligns better with what people actually want. It's a major reason modern chat models feel more helpful and less erratic than raw pretrained models.\n\nSource: MIT Agentic AI, Module 2 Glossary.",
     usecase_es:"Usar retroalimentación humana para guiar a un modelo hacia respuestas más útiles y preferidas.",
     prompt_es:"Una técnica de machine learning que usa retroalimentación humana — personas calificando o clasificando las respuestas del modelo — para mejorarlo, de forma que aprenda de manera más eficiente y se alinee mejor con lo que la gente realmente quiere. Es una de las razones principales por las que los modelos de chat modernos se sienten más útiles y menos erráticos que los modelos preentrenados sin ajustar.\n\nFuente: MIT Agentic AI, Glosario del Módulo 2."},

    {term:"Fine-Tuning", cat:"training", tags:["training","customization","mit"],
     usecase:"Further training a model on a specific dataset to sharpen it for one task.",
     prompt:"The process of adjusting and further training a machine learning model on a specific dataset to better perform a particular task, or to improve its accuracy and relevance for a desired application. It's how a general-purpose foundation model gets specialized without training from scratch.\n\nSource: MIT Agentic AI, Module 3 Glossary.",
     usecase_es:"Seguir entrenando un modelo con un conjunto de datos específico para especializarlo en una tarea.",
     prompt_es:"El proceso de ajustar y continuar entrenando un modelo de machine learning con un conjunto de datos específico, para que rinda mejor en una tarea particular o mejore su precisión y relevancia para una aplicación deseada. Es la forma en que un modelo fundacional de propósito general se especializa sin entrenarse desde cero.\n\nFuente: MIT Agentic AI, Glosario del Módulo 3."},

    {term:"Evals (Evaluations)", cat:"training", tags:["testing","mit","oreilly"],
     usecase:"Testing a model against benchmarks to measure its capabilities and gaps.",
     prompt:"The process of testing models against a set of criteria or benchmarks to measure their capabilities and identify areas for improvement. In production agent systems, evals are treated as an ongoing discipline, not a one-time check: correct data beats more data, telemetry feeds the eval dataset, and adversarial 'inject errors on purpose' testing catches failure modes normal testing misses.\n\nSource: MIT Agentic AI, Module 3 Glossary; O'Reilly, AI Harness Engineering.",
     usecase_es:"Probar un modelo contra benchmarks para medir sus capacidades y sus vacíos.",
     prompt_es:"El proceso de probar modelos contra un conjunto de criterios o benchmarks para medir sus capacidades e identificar áreas de mejora. En sistemas de agentes en producción, las evaluaciones se tratan como una disciplina continua, no como una revisión única: datos correctos vencen a más datos, la telemetría alimenta el conjunto de evaluación, y las pruebas adversariales de 'inyectar errores a propósito' detectan modos de falla que las pruebas normales pasan por alto.\n\nFuente: MIT Agentic AI, Glosario del Módulo 3; O'Reilly, AI Harness Engineering."},

    {term:"Reflection", cat:"training", tags:["technique","mit"],
     usecase:"A model reviewing and critiquing its own output to improve accuracy.",
     prompt:"An LLM training and inference technique where the model self-evaluates its outputs, improving accuracy and coherence by adjusting its parameters or reasoning strategy based on that self-critique — one building block behind more capable agentic behavior.\n\nSource: MIT Agentic AI, Module 5 Glossary.",
     usecase_es:"Un modelo que revisa y critica su propia salida para mejorar la precisión.",
     prompt_es:"Una técnica de entrenamiento e inferencia para LLMs en la que el modelo autoevalúa sus propias salidas, mejorando la precisión y coherencia al ajustar sus parámetros o su estrategia de razonamiento a partir de esa autocrítica — uno de los componentes detrás de un comportamiento agéntico más capaz.\n\nFuente: MIT Agentic AI, Glosario del Módulo 5."},

    {term:"Parametric vs. Non-Parametric Memory", cat:"training", tags:["memory","mit"],
     usecase:"Knowledge baked into a model's weights, versus knowledge it looks up on the fly.",
     prompt:"Parametric memory is knowledge stored directly in a large language model's parameters — it shapes the model's behavior but can only change through retraining or fine-tuning. Non-parametric memory doesn't rely on fixed parameters or a predefined model; it lets the LLM make decisions or predictions based on data presented to it at run time (e.g. retrieved documents), without that data ever being stored in the model itself.\n\nSource: MIT Agentic AI, Module 5 Glossary.",
     usecase_es:"Conocimiento incorporado en los pesos del modelo, frente a conocimiento que consulta al vuelo.",
     prompt_es:"La memoria paramétrica es el conocimiento almacenado directamente en los parámetros de un large language model — moldea el comportamiento del modelo, pero solo puede cambiar mediante reentrenamiento o fine-tuning. La memoria no paramétrica no depende de parámetros fijos ni de un modelo predefinido; permite que el LLM tome decisiones o haga predicciones a partir de datos que se le presentan en tiempo de ejecución (por ejemplo, documentos recuperados), sin que esos datos se almacenen jamás en el propio modelo.\n\nFuente: MIT Agentic AI, Glosario del Módulo 5."},

    {term:"AI Benchmarks", cat:"training", tags:["evaluation","oreilly"],
     usecase:"Standardized tests used as a starting point for measuring model quality.",
     prompt:"Benchmarks are a good starting point for evaluation, and a useful base for generating your own evaluation datasets while you build your own 'golden' dataset. Caution: LLM training can effectively 'cheat' by memorizing standard benchmarks, so benchmark scores alone should be used with care rather than as the final word on quality.\n\nSource: O'Reilly, AI Harness Engineering.",
     usecase_es:"Pruebas estandarizadas usadas como punto de partida para medir la calidad de un modelo.",
     prompt_es:"Los benchmarks son un buen punto de partida para la evaluación, y una base útil para generar tus propios conjuntos de evaluación mientras construyes tu propio dataset 'dorado' (golden). Precaución: el entrenamiento de LLMs puede efectivamente 'hacer trampa' memorizando benchmarks estándar, así que los puntajes de benchmark por sí solos deben usarse con cautela y no como la palabra final sobre la calidad.\n\nFuente: O'Reilly, AI Harness Engineering."},

    {term:"Vendor Lock-in", cat:"training", tags:["strategy","mit"],
     usecase:"Becoming so dependent on one AI vendor that switching becomes difficult or costly.",
     prompt:"Situations in which a customer becomes dependent on a vendor for products or services, making it difficult to switch to another alternative — a real strategic risk when a whole workflow is built around one model provider's specific APIs, prompts, or tools.\n\nSource: MIT Agentic AI, Module 3 Glossary.",
     usecase_es:"Volverse tan dependiente de un proveedor de IA que cambiarse resulta difícil o costoso.",
     prompt_es:"Situaciones en las que un cliente se vuelve dependiente de un proveedor para productos o servicios, lo que dificulta cambiarse a otra alternativa — un riesgo estratégico real cuando todo un flujo de trabajo se construye alrededor de las APIs, prompts o herramientas específicas de un proveedor de modelos.\n\nFuente: MIT Agentic AI, Glosario del Módulo 3."},

    // ---------- Agentic Systems & Reasoning ----------
    {term:"LLM Agent", cat:"agents", tags:["agents","mit"],
     usecase:"An LLM combined with tools, memory, and planning so it can act, not just answer.",
     prompt:"Combines an LLM with external modules, which may include tools, memory, and planning capability. This enables the LLM to respond more accurately to complex, multi-step questions and to actually take actions in the world rather than just generate text.\n\nSource: MIT Agentic AI, Module 2 Glossary.",
     usecase_es:"Un LLM combinado con herramientas, memoria y planificación para poder actuar, no solo responder.",
     prompt_es:"Combina un LLM con módulos externos, que pueden incluir herramientas, memoria y capacidad de planificación. Esto le permite al LLM responder con mayor precisión a preguntas complejas de varios pasos, y realmente tomar acciones en el mundo en lugar de solo generar texto.\n\nFuente: MIT Agentic AI, Glosario del Módulo 2."},

    {term:"The Agentic Loop", cat:"agents", tags:["agents","harvard"],
     usecase:"The receive → plan → act → observe → repeat cycle that defines how agents operate.",
     prompt:"Agents operate by receiving a prompt, breaking it into steps, performing an action, observing the output, and iterating until the goal is achieved. Tasks best suited for agents are iterative, have high information density, and contain clear logical decision points — humans still hold the advantage on novel events, connecting disparate dots, and cultural or ethical nuance.\n\nSource: Harvard Agentic AI, Module 2.",
     usecase_es:"El ciclo recibir → planificar → actuar → observar → repetir que define cómo operan los agentes.",
     prompt_es:"Los agentes operan recibiendo un prompt, descomponiéndolo en pasos, ejecutando una acción, observando el resultado, e iterando hasta lograr el objetivo. Las tareas más adecuadas para agentes son iterativas, tienen alta densidad de información y contienen puntos de decisión lógicos claros — los humanos aún tienen ventaja frente a eventos novedosos, conectar puntos dispersos, y matices culturales o éticos.\n\nFuente: Harvard Agentic AI, Módulo 2."},

    {term:"Reasoning (System 1 / System 2 Thinking)", cat:"agents", tags:["fundamentals","harvard"],
     usecase:"Fast, instinctive thinking vs. slow, deliberate multi-step thinking — and what lets an LLM plan.",
     prompt:"System 1 and System 2 Thinking are terms coined by psychologist Daniel Kahneman to describe two modes humans use to think: System 1 is fast and instinctive, requiring little effort; System 2 is slow, deliberate, and requires focused attention. In LLMs, Reasoning is the capability that allows a model to perform task decomposition, planning, and multi-step logic — analogous to System 2 thinking, and the breakthrough that lets an AI actually plan and follow complex processes instead of just pattern-matching.\n\nSource: Harvard Agentic AI, Module 2.",
     usecase_es:"Pensamiento rápido e instintivo frente a pensamiento lento y deliberado de varios pasos — y lo que permite planificar a un LLM.",
     prompt_es:"El Pensamiento Sistema 1 y Sistema 2 son términos acuñados por el psicólogo Daniel Kahneman para describir dos modos que usan los humanos para pensar: el Sistema 1 es rápido e instintivo, requiere poco esfuerzo; el Sistema 2 es lento, deliberado, y requiere atención enfocada. En los LLMs, el Razonamiento (Reasoning) es la capacidad que le permite a un modelo descomponer tareas, planificar y aplicar lógica de varios pasos — análogo al pensamiento Sistema 2, y el avance que le permite a una IA realmente planificar y seguir procesos complejos en lugar de solo reconocer patrones.\n\nFuente: Harvard Agentic AI, Módulo 2."},

    {term:"Context Engineering", cat:"agents", tags:["prompting","harvard"],
     usecase:"Designing the input an agent receives — not just the model — to get a good output.",
     prompt:"The value of an agent's output depends on the quality of its input. Good prompts and agent context cover four questions: Who? — the personality and perspective the AI should take on; What? — the tasks and goals; How? — the process and what a good answer looks like; and Why? — the situation, assumptions, and constraints. This reframes the work of using agents well from 'clever prompting' to deliberately engineering the whole context.\n\nSource: Harvard Agentic AI, Module 2.",
     usecase_es:"Diseñar la entrada que recibe un agente — no solo el modelo — para obtener un buen resultado.",
     prompt_es:"El valor de la salida de un agente depende de la calidad de su entrada. Los buenos prompts y el buen contexto de agente cubren cuatro preguntas: ¿Quién? — la personalidad y perspectiva que debe adoptar la IA; ¿Qué? — las tareas y objetivos; ¿Cómo? — el proceso y cómo luce una buena respuesta; y ¿Por qué? — la situación, los supuestos y las restricciones. Esto redefine el trabajo de usar bien los agentes: pasa de ser 'prompting ingenioso' a diseñar deliberadamente todo el contexto.\n\nFuente: Harvard Agentic AI, Módulo 2."},

    {term:"Model Context Protocol (MCP)", cat:"agents", tags:["infrastructure","harvard"],
     usecase:"A standard that lets tools tell an AI what actions they can perform.",
     prompt:"A standard that allows tools to provide information to an AI about what actions they can perform, making it possible for agents to discover and call external tools in a consistent way rather than needing bespoke integration code for each one.\n\nSource: Harvard Agentic AI, Module 2.",
     usecase_es:"Un estándar que permite que las herramientas le digan a una IA qué acciones pueden realizar.",
     prompt_es:"Un estándar que permite que las herramientas proporcionen información a una IA sobre qué acciones pueden realizar, haciendo posible que los agentes descubran y llamen herramientas externas de forma consistente, sin necesitar código de integración a medida para cada una.\n\nFuente: Harvard Agentic AI, Módulo 2."},

    {term:"Multi-Agent System (Swarm)", cat:"agents", tags:["architecture","harvard"],
     usecase:"Several specialized AI agents working together, usually under one orchestrator.",
     prompt:"A collection of agents — often one orchestrator plus several specialized sub-agents — working together to solve a complex problem, each handling a piece of the task rather than one agent trying to do everything.\n\nSource: Harvard Agentic AI, Module 2.",
     usecase_es:"Varios agentes de IA especializados trabajando juntos, normalmente bajo un orquestador.",
     prompt_es:"Un conjunto de agentes — a menudo un orquestador más varios sub-agentes especializados — trabajando juntos para resolver un problema complejo, cada uno encargándose de una parte de la tarea en lugar de que un solo agente intente hacerlo todo.\n\nFuente: Harvard Agentic AI, Módulo 2."},

    {term:"ReAct (Reason + Act)", cat:"agents", tags:["technique","mit"],
     usecase:"A prompting framework where a model interleaves reasoning steps with actions.",
     prompt:"A framework combining reasoning and acting within LLMs, generating reasoning traces and actions in an interleaved manner to enhance task completion — the model explains its thinking, takes an action, observes the result, and reasons again, rather than reasoning all at once up front.\n\nSource: MIT Agentic AI, Module 7 Glossary.",
     usecase_es:"Un framework de prompting donde el modelo alterna pasos de razonamiento con acciones.",
     prompt_es:"Un framework que combina razonamiento y acción dentro de los LLMs, generando trazas de razonamiento y acciones de forma intercalada para mejorar la finalización de tareas — el modelo explica su pensamiento, toma una acción, observa el resultado, y vuelve a razonar, en lugar de razonar todo de una vez al principio.\n\nFuente: MIT Agentic AI, Glosario del Módulo 7."},

    {term:"AutoGPT", cat:"agents", tags:["tools","mit"],
     usecase:"An early autonomous agent that generates and acts on its own prompts in a loop.",
     prompt:"An AI agent that autonomously executes tasks by iteratively generating, evaluating, and acting upon its own prompts — one of the earliest widely-known examples of a fully autonomous agentic loop.\n\nSource: MIT Agentic AI, Module 6 Glossary.",
     usecase_es:"Uno de los primeros agentes autónomos que genera y actúa sobre sus propios prompts en un bucle.",
     prompt_es:"Un agente de IA que ejecuta tareas de forma autónoma generando, evaluando y actuando iterativamente sobre sus propios prompts — uno de los primeros ejemplos ampliamente conocidos de un bucle agéntico totalmente autónomo.\n\nFuente: MIT Agentic AI, Glosario del Módulo 6."},

    // ---------- Memory, Retrieval & Tools ----------
    {term:"Retrieval-Augmented Generation (RAG)", cat:"memory", tags:["technique","mit"],
     usecase:"Pulling in relevant outside information before the model generates its answer.",
     prompt:"An LLM technique that retrieves relevant information from a large dataset to augment the input context before generating a response. This improves accuracy by grounding the model's output in external, verifiable sources instead of relying solely on what it memorized during training.\n\nSource: MIT Agentic AI, Module 3 Glossary.",
     usecase_es:"Traer información externa relevante antes de que el modelo genere su respuesta.",
     prompt_es:"Una técnica para LLMs que recupera información relevante de un conjunto de datos grande para complementar el contexto de entrada antes de generar una respuesta. Esto mejora la precisión al basar la salida del modelo en fuentes externas y verificables, en lugar de depender solo de lo que memorizó durante el entrenamiento.\n\nFuente: MIT Agentic AI, Glosario del Módulo 3."},

    {term:"Semantic Search", cat:"memory", tags:["retrieval","mit"],
     usecase:"Searching by meaning instead of exact keyword matches.",
     prompt:"A search technique that uses the meaning and context of words rather than just matching keywords, allowing LLMs to retrieve more relevant and accurate information based on the semantic similarity of queries and data — the retrieval half of most RAG systems.\n\nSource: MIT Agentic AI, Module 7 Glossary.",
     usecase_es:"Buscar por significado en lugar de por coincidencia exacta de palabras clave.",
     prompt_es:"Una técnica de búsqueda que usa el significado y el contexto de las palabras en lugar de solo coincidir palabras clave, permitiendo que los LLMs recuperen información más relevante y precisa según la similitud semántica entre las consultas y los datos — la mitad de 'recuperación' de la mayoría de los sistemas RAG.\n\nFuente: MIT Agentic AI, Glosario del Módulo 7."},

    {term:"LangChain", cat:"memory", tags:["tools","mit"],
     usecase:"A popular framework for wiring LLMs together with data sources and tools.",
     prompt:"A framework for developing applications using large language models by connecting them with various data sources and tools — one of the most widely used building blocks for constructing agentic and RAG applications.\n\nSource: MIT Agentic AI, Module 6 Glossary.",
     usecase_es:"Un framework popular para conectar LLMs con fuentes de datos y herramientas.",
     prompt_es:"Un framework para desarrollar aplicaciones usando large language models, conectándolos con diversas fuentes de datos y herramientas — uno de los componentes más usados para construir aplicaciones agénticas y de RAG.\n\nFuente: MIT Agentic AI, Glosario del Módulo 6."},

    {term:"Plugins", cat:"memory", tags:["tools","mit"],
     usecase:"Ready-made add-ons that let an LLM interact with outside tools and data.",
     prompt:"Ready-made applications that extend the functionality of LLMs by enabling them to interact with different tools and datasets — performing tasks like document summarization, data analysis, and more, without the model needing that capability built in natively.\n\nSource: MIT Agentic AI, Module 7 Glossary.",
     usecase_es:"Complementos listos para usar que permiten a un LLM interactuar con herramientas y datos externos.",
     prompt_es:"Aplicaciones ya construidas que extienden la funcionalidad de los LLMs, permitiéndoles interactuar con distintas herramientas y conjuntos de datos — realizando tareas como resumir documentos, analizar datos, y más, sin que el modelo necesite tener esa capacidad incorporada de forma nativa.\n\nFuente: MIT Agentic AI, Glosario del Módulo 7."},

    {term:"LLM External Context", cat:"memory", tags:["memory","mit"],
     usecase:"Permanent memory outside the model that it can search and edit.",
     prompt:"Refers to a permanent external memory that the LLM can edit and search, giving it far more effective memory than its built-in context window alone — it can save files and store context that persists beyond a single conversation.\n\nSource: MIT Agentic AI, Module 6 Glossary.",
     usecase_es:"Memoria permanente fuera del modelo que este puede buscar y editar.",
     prompt_es:"Se refiere a una memoria externa permanente que el LLM puede editar y consultar, dándole una memoria mucho más efectiva que solo su ventana de contexto incorporada — puede guardar archivos y almacenar contexto que persiste más allá de una sola conversación.\n\nFuente: MIT Agentic AI, Glosario del Módulo 6."},

    {term:"Application Programming Interface (API)", cat:"memory", tags:["infrastructure","harvard"],
     usecase:"The protocol an AI agent uses to actually operate other software.",
     prompt:"The protocol through which an AI agent accesses tools like Google Docs, Excel, or the internet — the mechanism that turns an agent from something that only talks into something that can actually do things in other systems.\n\nSource: Harvard Agentic AI, Module 2.",
     usecase_es:"El protocolo que un agente de IA usa para realmente operar otro software.",
     prompt_es:"El protocolo mediante el cual un agente de IA accede a herramientas como Google Docs, Excel, o internet — el mecanismo que convierte a un agente de algo que solo habla en algo que realmente puede hacer cosas en otros sistemas.\n\nFuente: Harvard Agentic AI, Módulo 2."},

    {term:"Prompt Flow", cat:"memory", tags:["tools","mit"],
     usecase:"A Microsoft tool for building, testing, and monitoring LLM apps end to end.",
     prompt:"A tool developed by Microsoft that allows users to build high-quality LLM apps, going from prototyping to testing, and then deployment and monitoring. It also allows users to evaluate RAG effectiveness and efficiency.\n\nSource: MIT Agentic AI, Module 5 Glossary.",
     usecase_es:"Una herramienta de Microsoft para construir, probar y monitorear aplicaciones de LLM de principio a fin.",
     prompt_es:"Una herramienta desarrollada por Microsoft que permite a los usuarios construir aplicaciones de LLM de alta calidad, pasando de prototipo a pruebas, y luego a despliegue y monitoreo. También permite evaluar la efectividad y eficiencia de sistemas RAG.\n\nFuente: MIT Agentic AI, Glosario del Módulo 5."},

    // ---------- Guardrails & Governance ----------
    {term:"Human-in-the-Loop (HITL)", cat:"safety", tags:["safety","oreilly"],
     usecase:"Keeping a person able to review, approve, or intervene in an agent's actions.",
     prompt:"Agency is a process, not a single leap to full autonomy — HITL means engineering agents to scale to humans whenever there's doubt. In practice: HITL partners agents with subject-matter experts, functions as a first-class capability of the agent itself (not a bolt-on), and every HITL interaction should be logged, both for accountability and to build the next round of training and eval data.\n\nSource: O'Reilly, AI Harness Engineering.",
     usecase_es:"Mantener a una persona con capacidad de revisar, aprobar o intervenir en las acciones de un agente.",
     prompt_es:"La autonomía (agency) es un proceso, no un salto único hacia la autonomía total — HITL significa diseñar los agentes para que escalen hacia humanos cada vez que haya duda. En la práctica: HITL asocia a los agentes con expertos en la materia, funciona como una capacidad de primer nivel del propio agente (no como un añadido), y cada interacción HITL debe registrarse, tanto para rendición de cuentas como para construir la siguiente ronda de datos de entrenamiento y evaluación.\n\nFuente: O'Reilly, AI Harness Engineering."},

    {term:"The Lethal Trifecta", cat:"safety", tags:["risk","security","oreilly"],
     usecase:"The dangerous combination of agent access, external comms, and untrusted input.",
     prompt:"If an agent can access sensitive data, talk to external entities, and receive arbitrary inputs, an attacker can use prompt injection to force a function call to a compromised endpoint and exfiltrate secret data. Mitigations: verify inputs ('trust but verify'), limit and opt-in to external calls, and treat any private-data access as a potential exfiltration path.\n\nSource: O'Reilly, AI Harness Engineering (citing Simon Willison, 'The Lethal Trifecta,' 2025).",
     usecase_es:"La combinación peligrosa de acceso del agente, comunicación externa, y entradas no confiables.",
     prompt_es:"Si un agente puede acceder a datos sensibles, comunicarse con entidades externas, y recibir entradas arbitrarias, un atacante puede usar inyección de prompts (prompt injection) para forzar una llamada de función hacia un endpoint comprometido y exfiltrar datos secretos. Mitigaciones: verificar las entradas ('confiar pero verificar'), limitar y requerir opt-in para llamadas externas, y tratar cualquier acceso a datos privados como una posible vía de exfiltración.\n\nFuente: O'Reilly, AI Harness Engineering (citando a Simon Willison, 'The Lethal Trifecta,' 2025)."},

    {term:"Agentic Harness", cat:"safety", tags:["architecture","oreilly"],
     usecase:"The safeguard architecture wrapped around an agent — evaluations, telemetry, and controls.",
     prompt:"Agents are enterprise-grade software, and no evaluation system alone fixes weak CI/CD, poor SRE practice, weak network security, or bad architecture — the fundamentals have to be right first. On top of that, an agentic harness adds: telemetry/observability, LLM evaluations, safeguards, prompt governance, context governance, model lifecycle management, benchmarks, human-in-the-loop, cost/token controls, and tool RBAC.\n\nSource: O'Reilly, AI Harness Engineering.",
     usecase_es:"La arquitectura de salvaguardas que envuelve a un agente — evaluaciones, telemetría y controles.",
     prompt_es:"Los agentes son software de nivel empresarial, y ningún sistema de evaluación por sí solo arregla un CI/CD débil, malas prácticas de SRE, seguridad de red débil, o mala arquitectura — primero hay que resolver los fundamentos. Sobre esa base, un agentic harness añade: telemetría/observabilidad, evaluaciones de LLM, salvaguardas, gobernanza de prompts, gobernanza de contexto, gestión del ciclo de vida del modelo, benchmarks, human-in-the-loop, controles de costo/tokens, y RBAC de herramientas.\n\nFuente: O'Reilly, AI Harness Engineering."},

    {term:"Prompt Governance", cat:"safety", tags:["governance","oreilly"],
     usecase:"Managing prompts as versioned, reviewed software artifacts rather than ad hoc text.",
     prompt:"Treat prompts as first-class assets — software artifacts subject to evolution, change, and review, not one-off text pasted into a script. Build prompts from standard, validated templates so corporate brand, style, and purpose stay consistent, and refine them based on evaluation results rather than gut feel.\n\nSource: O'Reilly, AI Harness Engineering.",
     usecase_es:"Gestionar los prompts como artefactos de software versionados y revisados, no como texto improvisado.",
     prompt_es:"Tratar los prompts como activos de primer nivel — artefactos de software sujetos a evolución, cambio y revisión, no texto pegado una sola vez en un script. Construir los prompts a partir de plantillas estándar y validadas para que la marca, el estilo y el propósito corporativo se mantengan consistentes, y refinarlos según los resultados de evaluación en lugar de por intuición.\n\nFuente: O'Reilly, AI Harness Engineering."},

    {term:"Tool Access / RBAC (Least Privilege)", cat:"safety", tags:["security","oreilly"],
     usecase:"Giving an agent only the tool permissions it actually needs, and auditing how it uses them.",
     prompt:"Tool usage is itself a source of risk — apply minimum privilege and role-based access control (RBAC) to what an LLM agent can call. The same agent serving an external employee and serving a CEO should not have identical permissions. Audit tool usage and keep traces: protocols like MCP make tool access easy, but also make misuse easier if it isn't restricted and monitored.\n\nSource: O'Reilly, AI Harness Engineering.",
     usecase_es:"Darle a un agente solo los permisos de herramientas que realmente necesita, y auditar cómo los usa.",
     prompt_es:"El uso de herramientas es en sí mismo una fuente de riesgo — aplica el principio de mínimo privilegio y control de acceso basado en roles (RBAC) a lo que puede invocar un agente LLM. El mismo agente atendiendo a un empleado externo y a un CEO no debería tener los mismos permisos. Audita el uso de herramientas y conserva trazas: protocolos como MCP facilitan el acceso a herramientas, pero también facilitan el mal uso si no se restringe y se monitorea.\n\nFuente: O'Reilly, AI Harness Engineering."},

    {term:"Telemetry & Observability", cat:"safety", tags:["operations","oreilly"],
     usecase:"Instrumenting agents so you can see what they're actually doing in production.",
     prompt:"Start with telemetry, then refine it — don't over-engineer before you have a working baseline. Most agentic telemetry systems build on OTEL (the 2019 open observability standard), with platforms like Langfuse, Microsoft Foundry, Datadog, or Langsmith collecting the data; most agentic SDKs (LangChain, CrewAI, and others) ship with telemetry support built in.\n\nSource: O'Reilly, AI Harness Engineering.",
     usecase_es:"Instrumentar a los agentes para poder ver qué están haciendo realmente en producción.",
     prompt_es:"Empieza con telemetría, y luego refínala — no sobre-diseñes antes de tener una línea base funcionando. La mayoría de los sistemas de telemetría agéntica se construyen sobre OTEL (el estándar abierto de observabilidad de 2019), con plataformas como Langfuse, Microsoft Foundry, Datadog o Langsmith recolectando los datos; la mayoría de los SDKs agénticos (LangChain, CrewAI y otros) traen soporte de telemetría incorporado.\n\nFuente: O'Reilly, AI Harness Engineering."},

    {term:"Governance Assessment (Ownership, Guardrails, Shipping Safely)", cat:"safety", tags:["governance","framework","oreilly"],
     usecase:"A five-area framework for scoring how ready an organization is to ship AI-assisted work safely.",
     prompt:"A structured self-assessment across five areas: Ownership and Software Estate (who owns each service, and do you have visibility into it); Autonomy and Alignment (can teams move independently within shared standards); Engineering Enablement (paved roads and self-service platforms, including for AI coding agents); Automated Guardrails for Quality and Security (policy enforcement in CI/CD, scanning, including AI-generated code); and Shipping Safely (progressive delivery, fast rollback, observability, blameless post-incident reviews). The lowest-scoring area is where to focus first, since weaknesses there undermine the rest.\n\nSource: O'Reilly, 'Governance and Guardrails for AI-Enabled Organizations' (Sarah Wells).",
     usecase_es:"Un framework de cinco áreas para calificar qué tan lista está una organización para lanzar trabajo asistido por IA de forma segura.",
     prompt_es:"Una autoevaluación estructurada en cinco áreas: Propiedad y Estado del Software (quién es dueño de cada servicio, y si tienes visibilidad sobre él); Autonomía y Alineación (si los equipos pueden avanzar de forma independiente dentro de estándares compartidos); Habilitación de Ingeniería (caminos pavimentados y plataformas de autoservicio, incluso para agentes de codificación con IA); Guardrails Automatizados para Calidad y Seguridad (aplicación de políticas en CI/CD, escaneo, incluyendo código generado por IA); y Lanzar de Forma Segura (entrega progresiva, rollback rápido, observabilidad, revisiones post-incidente sin culpar). El área con puntaje más bajo es donde enfocarse primero, ya que sus debilidades socavan al resto.\n\nFuente: O'Reilly, 'Governance and Guardrails for AI-Enabled Organizations' (Sarah Wells)."},

    // ---------- Memory Engineering (added from O'Reilly AI Memory Management bootcamp) ----------
    {term:"Memory Engineering", cat:"memory", tags:["discipline","oreilly"],
     usecase:"The discipline of turning an agent's transient context into durable, governed knowledge.",
     prompt:"Memory engineering is the discipline of designing the cognitive and technical scaffolding that transforms transient context into persistent, adaptive knowledge — governing how information flows between stores, the context window, and back, and forming the foundation for continual learning. In practice it means owning: the schema (memory unit modelling), the lifecycle (TTL, decay, forgetting), recall (indexing and retrieval), the evolution (consolidation and 'dreaming'), the evidence (memory evaluation), and the trust (provenance, PII, and poisoning gates).\n\nSource: O'Reilly, 'AI Memory Management in Agentic Systems' (Richmond Alake).",
     usecase_es:"La disciplina de convertir el contexto pasajero de un agente en conocimiento duradero y gobernado.",
     prompt_es:"La ingeniería de memoria (memory engineering) es la disciplina de diseñar el andamiaje cognitivo y técnico que transforma el contexto pasajero en conocimiento persistente y adaptable — gobernando cómo fluye la información entre los almacenes, la ventana de contexto, y de vuelta, y formando la base para el aprendizaje continuo. En la práctica significa ser dueño de: el esquema (modelado de unidades de memoria), el ciclo de vida (TTL, decaimiento, olvido), la recuperación (indexación y búsqueda), la evolución (consolidación y 'dreaming'), la evidencia (evaluación de memoria), y la confianza (procedencia, PII, y controles contra envenenamiento de datos).\n\nFuente: O'Reilly, 'AI Memory Management in Agentic Systems' (Richmond Alake)."},

    {term:"The Four Rs of Agent Memory", cat:"memory", tags:["framework","oreilly"],
     usecase:"Retain, recall, reuse, refine — the four operations that define what memory is for.",
     prompt:"A framework for what agent memory actually needs to do: Retain (decide what's worth keeping), Recall (find it again when relevant), Reuse (apply it to the current task), and Refine (update or correct it over time). Long-term memory is described as 'where the four Rs stop being aspiration and become storage' — the point where these operations move from theory into an actual persistent system.\n\nSource: O'Reilly, 'AI Memory Management in Agentic Systems' (Richmond Alake).",
     usecase_es:"Retener, recordar, reutilizar, refinar — las cuatro operaciones que definen para qué sirve la memoria.",
     prompt_es:"Un framework para lo que la memoria de un agente realmente necesita hacer: Retener (decidir qué vale la pena guardar), Recordar (encontrarlo de nuevo cuando sea relevante), Reutilizar (aplicarlo a la tarea actual), y Refinar (actualizarlo o corregirlo con el tiempo). La memoria de largo plazo se describe como 'el punto donde las cuatro R dejan de ser una aspiración y se convierten en almacenamiento' — el momento en que estas operaciones pasan de la teoría a un sistema persistente real.\n\nFuente: O'Reilly, 'AI Memory Management in Agentic Systems' (Richmond Alake)."},

    {term:"Working Memory (Short-Term Memory)", cat:"memory", tags:["memory","oreilly"],
     usecase:"An agent's temporary scratchpad for the task currently in progress.",
     prompt:"Working memory is the agent's temporary workspace for manipulating information during active tasks — a scratchpad holding intermediate results, current observations, and in-progress computation. It's turn-scoped and in-flight, implemented either as a managed segment of the active prompt (what stays in, gets compressed, or gets flushed as the context window fills) or as session storage: keyed temporary state outside the window, injected selectively, and cleared when the session ends. Both expire by design — promotion to long-term memory is a deliberate decision, not a default.\n\nSource: O'Reilly, 'AI Memory Management in Agentic Systems' (Richmond Alake).",
     usecase_es:"El bloc de notas temporal de un agente para la tarea que tiene en curso.",
     prompt_es:"La memoria de trabajo (working memory) es el espacio temporal del agente para manipular información durante tareas activas — un bloc de notas que guarda resultados intermedios, observaciones actuales, y cómputo en curso. Está acotada al turno actual y en vuelo, implementada ya sea como un segmento gestionado del prompt activo (qué se mantiene, qué se comprime, o qué se descarta a medida que se llena la ventana de contexto) o como almacenamiento de sesión: estado temporal indexado por clave fuera de la ventana, inyectado selectivamente, y borrado cuando termina la sesión. Ambas formas expiran por diseño — promover algo a memoria de largo plazo es una decisión deliberada, no algo que ocurre por defecto.\n\nFuente: O'Reilly, 'AI Memory Management in Agentic Systems' (Richmond Alake)."},

    {term:"Long-Term Memory (Procedural, Episodic, Semantic)", cat:"memory", tags:["memory","oreilly"],
     usecase:"An agent's persistent knowledge — skills, stories, and facts that survive across sessions.",
     prompt:"Long-term memory is the persistent knowledge foundation that lets agents maintain continuity, accumulate learning, and evolve capability across sessions — summarized as 'skills, stories and facts.' It splits into three types: Procedural (how to do things — workflows, tools, learned skills), Episodic (what happened — conversations and their summaries), and Semantic (what is known — facts, entities, the knowledge base). Unlike working memory, it persists cross-turn and cross-thread by design, and it forgets by policy, never by accident.\n\nSource: O'Reilly, 'AI Memory Management in Agentic Systems' (Richmond Alake).",
     usecase_es:"El conocimiento persistente de un agente — habilidades, historias y hechos que sobreviven entre sesiones.",
     prompt_es:"La memoria de largo plazo es la base de conocimiento persistente que le permite a los agentes mantener continuidad, acumular aprendizaje, y evolucionar su capacidad a través de las sesiones — resumida como 'habilidades, historias y hechos.' Se divide en tres tipos: Procedimental (cómo hacer las cosas — flujos de trabajo, herramientas, habilidades aprendidas), Episódica (qué pasó — conversaciones y sus resúmenes), y Semántica (qué se sabe — hechos, entidades, la base de conocimiento). A diferencia de la memoria de trabajo, persiste entre turnos e hilos por diseño, y olvida por política, nunca por accidente.\n\nFuente: O'Reilly, 'AI Memory Management in Agentic Systems' (Richmond Alake)."},

    {term:"Semantic Cache", cat:"memory", tags:["retrieval","performance","oreilly"],
     usecase:"Caching answers by the meaning of a question, not its exact wording, to skip repeat inference.",
     prompt:"A semantic cache stores recent query-and-response pairs indexed by meaning rather than exact text: vector embeddings identify when a new query carries the same underlying intent as one already answered (e.g. 'forgot my password' and 'can't log in'), and the cached response is returned without a fresh LLM inference. It's short-term by nature — cache hits decay as products, policies, and models change, so it's rebuilt from live traffic rather than archived. In one worked example this cut response time from roughly 2,000ms (full inference) to about 50ms — a ~40x speedup.\n\nSource: O'Reilly, 'AI Memory Management in Agentic Systems' (Richmond Alake).",
     usecase_es:"Cachear respuestas según el significado de una pregunta, no su redacción exacta, para evitar repetir la inferencia.",
     prompt_es:"Una caché semántica almacena pares recientes de consulta y respuesta indexados por significado en lugar de texto exacto: los embeddings vectoriales identifican cuándo una nueva consulta tiene la misma intención subyacente que una ya respondida (por ejemplo, 'olvidé mi contraseña' y 'no puedo iniciar sesión'), y se devuelve la respuesta cacheada sin una nueva inferencia del LLM. Es de naturaleza temporal — los aciertos de caché se degradan a medida que cambian los productos, políticas y modelos, así que se reconstruye a partir del tráfico en vivo en lugar de archivarse. En un ejemplo trabajado, esto redujo el tiempo de respuesta de aproximadamente 2,000ms (inferencia completa) a unos 50ms — una aceleración de ~40x.\n\nFuente: O'Reilly, 'AI Memory Management in Agentic Systems' (Richmond Alake)."},

    {term:"Workflow Memory", cat:"memory", tags:["agents","oreilly"],
     usecase:"An agent remembering how a task was done before — including its failures — so it improves next time.",
     prompt:"A type of procedural memory: the record of how an agent executed a task, including dead ends and failures, treated as experience rather than just discarded noise. A failed attempt (e.g. an unauthorized refund that needed a recovery step) still teaches the agent something about the workflow it should follow next time.\n\nSource: O'Reilly, 'AI Memory Management in Agentic Systems' (Richmond Alake).",
     usecase_es:"Un agente que recuerda cómo se hizo una tarea antes — incluyendo sus fallas — para mejorar la próxima vez.",
     prompt_es:"Un tipo de memoria procedimental: el registro de cómo un agente ejecutó una tarea, incluyendo callejones sin salida y fallas, tratado como experiencia y no simplemente descartado como ruido. Un intento fallido (por ejemplo, un reembolso no autorizado que necesitó un paso de recuperación) igual le enseña al agente algo sobre el flujo de trabajo que debería seguir la próxima vez.\n\nFuente: O'Reilly, 'AI Memory Management in Agentic Systems' (Richmond Alake)."},

    {term:"Ontology Layer", cat:"memory", tags:["memory","architecture","oreilly"],
     usecase:"The agent's model of what exists — entity types, relationships, and constraints that give memory its schema.",
     prompt:"The ontology layer defines the agent's model of what exists: the entity types, relationships, and constraints that give memory its schema — so two different mentions of the same real-world entity resolve to one node, not two separate strings. It's designed up front, before anything is remembered: the shape a valid memory must fit, not something that emerges from the data afterward. It lives inside the database as the schema and entity graph. Its three jobs are to TYPE (represent entities, not just strings), RELATE (build the graph between facts), and CONSTRAIN (define what counts as a valid memory) — and it's the layer that gives extraction and retrieval something structured to write into.\n\nIt sits alongside the memory, semantic, and context layers in the same architecture, each on its own clock: ontology and semantic are designed up front, memory accumulates over time, and context is assembled fresh on every call — meaning, then state, then attention. Despite sharing the word, it is not semantic memory.\n\nSource: O'Reilly, 'AI Memory Management in Agentic Systems' course.",
     usecase_es:"El modelo del agente sobre lo que existe — tipos de entidades, relaciones y restricciones que le dan a la memoria su esquema.",
     prompt_es:"La capa de ontología (ontology layer) define el modelo del agente sobre lo que existe: los tipos de entidades, relaciones y restricciones que le dan a la memoria su esquema — de modo que dos menciones distintas de la misma entidad del mundo real se resuelven en un solo nodo, no en dos cadenas de texto separadas. Se diseña de antemano, antes de que se recuerde nada: es la forma que debe tener una memoria válida, no algo que emerge de los datos después. Vive dentro de la base de datos como el esquema y el grafo de entidades. Sus tres funciones son TIPIFICAR (representar entidades, no solo cadenas de texto), RELACIONAR (construir el grafo entre los hechos), y RESTRINGIR (definir qué cuenta como una memoria válida) — y es la capa que le da a la extracción y a la recuperación algo estructurado en qué escribir.\n\nConvive con las capas de memoria, semántica y contexto dentro de la misma arquitectura, cada una con su propio ritmo: la ontología y la semántica se diseñan de antemano, la memoria se acumula con el tiempo, y el contexto se ensambla de nuevo en cada llamada — primero el significado, luego el estado, luego la atención. Aunque comparte la palabra, no es lo mismo que la memoria semántica.\n\nFuente: curso de O'Reilly, 'AI Memory Management in Agentic Systems'."},

    // ---------- Safe Deployment & Guardrails (added from O'Reilly 'Deploying AI Systems Safely') ----------
    {term:"Golden Dataset", cat:"training", tags:["evaluation","oreilly"],
     usecase:"A curated set of verified, ideal-behavior examples used as ground truth for testing and judges.",
     prompt:"A golden dataset is high-quality, verified data representing ideal agent behavior and correct outcomes — used both as a reference for continuous integration and regression testing, and as ground truth to train and validate automated evaluators (an 'LLM-as-a-judge'). A full evaluation portfolio also includes a regression set (every important bug seen before), an edge-case set (ambiguous or unusual accounts), and an adversarial set (prompt injection, malicious content, unsafe tool requests) — production failures should graduate into future release tests.\n\nSource: O'Reilly, 'Deploying AI Systems Safely' (Apurva Misra).",
     usecase_es:"Un conjunto curado de ejemplos verificados de comportamiento ideal, usado como verdad de referencia para pruebas y jueces.",
     prompt_es:"Un golden dataset es un conjunto de datos verificados y de alta calidad que representa el comportamiento ideal de un agente y sus resultados correctos — usado tanto como referencia para integración continua y pruebas de regresión, como verdad de referencia para entrenar y validar evaluadores automatizados (un 'LLM-as-a-judge'). Un portafolio de evaluación completo también incluye un conjunto de regresión (cada bug importante visto antes), un conjunto de casos límite (cuentas ambiguas o inusuales), y un conjunto adversarial (inyección de prompts, contenido malicioso, solicitudes de herramientas inseguras) — las fallas en producción deberían convertirse en futuras pruebas de release.\n\nFuente: O'Reilly, 'Deploying AI Systems Safely' (Apurva Misra)."},

    {term:"LLM-as-a-Judge", cat:"training", tags:["evaluation","oreilly"],
     usecase:"Using one LLM, with a carefully written rubric, to automatically grade another model's outputs.",
     prompt:"A technique where an LLM evaluates another model's output against a rubric — useful for scoring at a volume no human review team could match. Getting it right requires refining the judge prompt with a clear criterion, precise pass/fail definitions, few-shot examples, and a structured output format, then running a 'judge alignment loop' to check the judge's verdicts against human judgment (tracked via true-positive and true-negative rates) before trusting it to gate releases.\n\nSource: O'Reilly, 'Deploying AI Systems Safely' (Apurva Misra).",
     usecase_es:"Usar un LLM, con una rúbrica cuidadosamente escrita, para calificar automáticamente las salidas de otro modelo.",
     prompt_es:"Una técnica en la que un LLM evalúa la salida de otro modelo contra una rúbrica — útil para calificar a un volumen que ningún equipo de revisión humana podría igualar. Hacerlo bien requiere refinar el prompt del juez con un criterio claro, definiciones precisas de aprobado/reprobado, ejemplos few-shot, y un formato de salida estructurado, y luego correr un 'bucle de alineación del juez' para comparar los veredictos del juez contra el criterio humano (medido con tasas de verdaderos positivos y verdaderos negativos) antes de confiarle la aprobación de releases.\n\nFuente: O'Reilly, 'Deploying AI Systems Safely' (Apurva Misra)."},

    {term:"Progressive Autonomy Rollout", cat:"safety", tags:["deployment","oreilly"],
     usecase:"Expanding what an agent is allowed to do in careful stages, not all at once.",
     prompt:"Rather than granting an agent full autonomy immediately, roll it out along a staged ladder: Read-only (answer questions, inspect settings — cannot write) → Recommend → Preview (agent proposes changes, a human clicks Apply) → Low-risk autonomy (can draft content, update descriptions; some actions still need confirmation) → High-risk autonomy. A release can advance along two independent dimensions — user exposure (1% → 10% → 50% → 100%) and autonomy level — so a team can widen who sees a feature without necessarily widening what it's allowed to do.\n\nSource: O'Reilly, 'Deploying AI Systems Safely' (Apurva Misra).",
     usecase_es:"Ampliar lo que un agente puede hacer en etapas cuidadosas, no de golpe.",
     prompt_es:"En lugar de otorgarle a un agente autonomía total de inmediato, se despliega por una escalera de etapas: Solo lectura (responde preguntas, inspecciona configuraciones — no puede escribir) → Recomendar → Vista previa (el agente propone cambios, un humano hace clic en Aplicar) → Autonomía de bajo riesgo (puede redactar contenido, actualizar descripciones; algunas acciones aún requieren confirmación) → Autonomía de alto riesgo. Un release puede avanzar en dos dimensiones independientes — exposición de usuarios (1% → 10% → 50% → 100%) y nivel de autonomía — así un equipo puede ampliar quién ve una función sin necesariamente ampliar lo que esa función puede hacer.\n\nFuente: O'Reilly, 'Deploying AI Systems Safely' (Apurva Misra)."},

    {term:"Release Gates", cat:"safety", tags:["deployment","oreilly"],
     usecase:"Hard numeric thresholds an AI system must clear before it ships — not a subjective 'looks good.'",
     prompt:"Concrete, measurable thresholds a candidate release must pass before going live — for example: product Q&A accuracy ≥95%, correct final state ≥98%, critical permission failures = 0, duplicate writes = 0, invalid tool calls <0.5%, unauthorized configuration changes = 0, P95 latency <5 seconds. The point is that 'looks good' is not a release criterion — every gate needs a number, and severity matters more than raw frequency (one bad incorrect configuration that fires 4,000 emails outweighs a small percentage-point win elsewhere).\n\nSource: O'Reilly, 'Deploying AI Systems Safely' (Apurva Misra).",
     usecase_es:"Umbrales numéricos estrictos que un sistema de IA debe superar antes de lanzarse — no un 'se ve bien' subjetivo.",
     prompt_es:"Umbrales concretos y medibles que un release candidato debe superar antes de salir a producción — por ejemplo: precisión de Q&A del producto ≥95%, estado final correcto ≥98%, fallas críticas de permisos = 0, escrituras duplicadas = 0, llamadas de herramientas inválidas <0.5%, cambios de configuración no autorizados = 0, latencia P95 <5 segundos. La idea es que 'se ve bien' no es un criterio de release — cada gate necesita un número, y la severidad importa más que la frecuencia bruta (una configuración incorrecta que dispara 4,000 correos pesa más que una pequeña mejora porcentual en otro lado).\n\nFuente: O'Reilly, 'Deploying AI Systems Safely' (Apurva Misra)."},

    {term:"Capability Kill Switch", cat:"safety", tags:["deployment","risk","oreilly"],
     usecase:"The ability to shut off one specific agent capability without shutting the whole agent down.",
     prompt:"The ability to independently disable a specific agent capability — email sending, automation creation, bulk updates, external integrations — while preserving others, like question-answering or read-only inspection. The guiding principle: 'the safest rollback may be reduced autonomy, not total shutdown.' It pairs with two kinds of rollback: a software rollback (restoring the model, prompt, tools, policy, or app version) and a state rollback (undoing what the agent actually changed — status updates, sent emails, automations) — and some actions, like an email already sent, simply can't be undone, only recovered from.\n\nSource: O'Reilly, 'Deploying AI Systems Safely' (Apurva Misra).",
     usecase_es:"La capacidad de apagar una capacidad específica de un agente sin apagar todo el agente.",
     prompt_es:"La capacidad de desactivar de forma independiente una capacidad específica de un agente — envío de correos, creación de automatizaciones, actualizaciones masivas, integraciones externas — mientras se preservan otras, como responder preguntas o la inspección de solo lectura. El principio guía: 'el rollback más seguro puede ser reducir la autonomía, no un apagado total.' Se combina con dos tipos de rollback: un rollback de software (restaurar el modelo, el prompt, las herramientas, la política, o la versión de la app) y un rollback de estado (deshacer lo que el agente realmente cambió — actualizaciones de estado, correos enviados, automatizaciones) — y algunas acciones, como un correo ya enviado, simplemente no se pueden deshacer, solo remediar.\n\nFuente: O'Reilly, 'Deploying AI Systems Safely' (Apurva Misra)."},

    {term:"Undo Rate", cat:"safety", tags:["monitoring","oreilly"],
     usecase:"How often users manually reverse what an agent just did — a signal accuracy metrics can miss.",
     prompt:"The rate at which users correct or reverse an agent's actions ('No,' 'Undo,' an immediate manual edit) — implicit negative feedback that can reveal a behavioral failure even when the agent technically succeeded: it didn't crash, produced valid output, completed the task, and users still keep reversing its work. The broader lesson: monitor what the agent actually changes in the system (side effects — unexpected emails, duplicate records, bulk updates), not only what the model says it did.\n\nSource: O'Reilly, 'Deploying AI Systems Safely' (Apurva Misra).",
     usecase_es:"Con qué frecuencia los usuarios revierten manualmente lo que un agente acaba de hacer — una señal que las métricas de precisión pueden pasar por alto.",
     prompt_es:"La tasa a la que los usuarios corrigen o revierten las acciones de un agente ('No,' 'Deshacer,' una edición manual inmediata) — retroalimentación negativa implícita que puede revelar una falla de comportamiento incluso cuando el agente técnicamente tuvo éxito: no falló, produjo una salida válida, completó la tarea, y aun así los usuarios siguen revirtiendo su trabajo. La lección más amplia: monitorea lo que el agente realmente cambia en el sistema (efectos secundarios — correos inesperados, registros duplicados, actualizaciones masivas), no solo lo que el modelo dice que hizo.\n\nFuente: O'Reilly, 'Deploying AI Systems Safely' (Apurva Misra)."},

    // ---------- Voice & Multimodal AI (added from O'Reilly 'Building Apps with Voice AI APIs') ----------
    {term:"STT → LLM → TTS Pipeline", cat:"voice", tags:["architecture","oreilly"],
     usecase:"The three-stage pipeline behind most voice agents: hear it, think about it, say it back.",
     prompt:"The standard architecture for a voice agent: Speech-to-Text (STT, also called ASR) transcribes the caller's audio into text; an LLM reasons over that text and decides what to say; Text-to-Speech (TTS) converts the response back into audio. Every stage is a swappable model, and every stage is a place where quality or latency can be won or lost — a production target is often streaming STT→LLM→TTS end-to-end in under one second.\n\nSource: O'Reilly, 'Building Apps with Voice AI APIs.'",
     usecase_es:"El pipeline de tres etapas detrás de la mayoría de los agentes de voz: escuchar, pensar, y responder hablando.",
     prompt_es:"La arquitectura estándar de un agente de voz: Speech-to-Text (STT, también llamado ASR) transcribe el audio de la persona que llama a texto; un LLM razona sobre ese texto y decide qué decir; Text-to-Speech (TTS) convierte la respuesta de vuelta a audio. Cada etapa es un modelo intercambiable, y en cada etapa se puede ganar o perder calidad o latencia — una meta común en producción es transmitir STT→LLM→TTS de punta a punta en menos de un segundo.\n\nFuente: O'Reilly, 'Building Apps with Voice AI APIs.'"},

    {term:"Time-to-First-Byte (TTFB) & Real-Time Factor (RTF)", cat:"voice", tags:["performance","oreilly"],
     usecase:"The two core latency metrics for voice AI: how fast it starts talking, and how fast it generates audio.",
     prompt:"TTFB (Time-to-First-Byte) is the time in milliseconds from a request to the first audio chunk coming back — the key metric for a live conversational agent, since it determines how natural the turn-taking feels. RTF (Real-Time Factor) is synthesis time divided by audio duration; an RTF below 1 means the system generates audio faster than real time (e.g. an RTF of 0.195 means 10 seconds of audio generated in about 2 seconds). TTFB matters most for live agents; RTF matters most for batch/offline jobs where total throughput is what counts. Both are hardware- and benchmark-specific, not portable guarantees — always label figures with P50/P95 and the measurement conditions.\n\nSource: O'Reilly, 'Building Apps with Voice AI APIs' (citing Telnyx, Fish Audio, and HiFi-GAN benchmarks).",
     usecase_es:"Las dos métricas clave de latencia para IA de voz: qué tan rápido empieza a hablar, y qué tan rápido genera el audio.",
     prompt_es:"TTFB (Time-to-First-Byte) es el tiempo en milisegundos desde una solicitud hasta que regresa el primer fragmento de audio — la métrica clave para un agente conversacional en vivo, ya que determina qué tan natural se siente el intercambio de turnos. RTF (Real-Time Factor) es el tiempo de síntesis dividido entre la duración del audio; un RTF menor a 1 significa que el sistema genera audio más rápido que en tiempo real (por ejemplo, un RTF de 0.195 significa generar 10 segundos de audio en unos 2 segundos). El TTFB importa más para agentes en vivo; el RTF importa más para trabajos por lotes/offline donde lo que cuenta es el throughput total. Ambos son específicos del hardware y del benchmark usado, no son garantías portables — siempre etiqueta las cifras con P50/P95 y las condiciones de medición.\n\nFuente: O'Reilly, 'Building Apps with Voice AI APIs' (citando benchmarks de Telnyx, Fish Audio, y HiFi-GAN)."},

    {term:"Audio Codec (for Voice AI)", cat:"voice", tags:["infrastructure","oreilly"],
     usecase:"The format audio is compressed into for transport — a real trade-off between quality, size, and latency.",
     prompt:"The choice of audio codec is a direct trade-off between quality, file size, and decode latency — critical for streaming voice agents where every millisecond of decode time adds to perceived response delay. Opus, for example, is called out as a low-latency, high-quality codec at low bitrate, making it a common choice for real-time streaming agents over telephony or web audio.\n\nSource: O'Reilly, 'Building Apps with Voice AI APIs.'",
     usecase_es:"El formato al que se comprime el audio para transportarlo — una decisión de compromiso real entre calidad, tamaño y latencia.",
     prompt_es:"La elección del códec de audio es un compromiso directo entre calidad, tamaño de archivo, y latencia de decodificación — crítico para agentes de voz en streaming, donde cada milisegundo de tiempo de decodificación se suma al retraso percibido en la respuesta. Opus, por ejemplo, se destaca como un códec de baja latencia y alta calidad a bitrate bajo, lo que lo convierte en una opción común para agentes de streaming en tiempo real sobre telefonía o audio web.\n\nFuente: O'Reilly, 'Building Apps with Voice AI APIs.'"}
  ];


  // ---------- state ----------
  var STORAGE_KEY = 'ai-lexicon-entries';
  var isEditMode = false;
  try {
    isEditMode = new URLSearchParams(window.location.search).get('edit') === '1';
  } catch(e){}
  document.body.classList.add(isEditMode ? 'is-editor' : 'is-public');

  var state = (function(){
    if(isEditMode){
      try {
        var raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw !== null) {
          var stored = JSON.parse(raw);
          if (Array.isArray(stored)) return stored;
        }
      } catch(e){}
    }
    return SEED.map(function(s, i){ return Object.assign({ id: 's'+i }, s); });
  })();

  var savedLang = 'en';
  try {
    var siteLang = window.localStorage.getItem('monkyfi.lang');
    if(siteLang === 'ES') savedLang = 'es';
    else savedLang = window.localStorage.getItem('lexicon-lang') || 'en';
  } catch(e){}

  var ui = {
    view: 'category',      // category | alpha | tags
    activeCat: null,
    activeTag: null,
    query: '',
    openId: null,
    editId: null,
    pendingDelete: null,
    lang: (savedLang === 'es') ? 'es' : 'en'
  };

  // A save reloads this view to the new version (that's how artifact
  // publish works), so whatever filter/search/open-card the viewer had
  // gets wiped unless we stash it first and restore it right after reload.
  var STASH_KEY = 'lexicon-ui-stash';
  try {
    var stashed = window.sessionStorage.getItem(STASH_KEY);
    if(stashed){
      var s = JSON.parse(stashed);
      if(s && typeof s === 'object'){
        if(s.view) ui.view = s.view;
        if('activeCat' in s) ui.activeCat = s.activeCat;
        if('activeTag' in s) ui.activeTag = s.activeTag;
        if('query' in s) ui.query = s.query;
        if('openId' in s) ui.openId = s.openId;
      }
      window.sessionStorage.removeItem(STASH_KEY);
    }
  } catch(e){}

  function stashUiState(){
    try {
      window.sessionStorage.setItem(STASH_KEY, JSON.stringify({
        view: ui.view, activeCat: ui.activeCat, activeTag: ui.activeTag, query: ui.query, openId: ui.openId
      }));
    } catch(e){}
  }

  var catByKey = {};
  CATEGORIES.forEach(function(c){ catByKey[c.key] = c; });

  function tr(key){
    var dict = STRINGS[ui.lang] || STRINGS.en;
    return (key in dict) ? dict[key] : (STRINGS.en[key] || key);
  }

  function catLabel(c){
    if(!c) return '';
    if(typeof c.label === 'string') return c.label;
    return (c.label && (c.label[ui.lang] || c.label.en)) || c.key || '';
  }

  function catLabelByKey(key){
    return catLabel(catByKey[key]) || key;
  }

  function setLang(lang){
    ui.lang = (lang === 'es') ? 'es' : 'en';
    try { window.localStorage.setItem('lexicon-lang', ui.lang); } catch(e){}
    render();
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // Renders a prompt's raw text as structured sections when it follows a
  // labeled format (##HEADER blocks, "Who? — ...", "1. Label — ...",
  // "Template — ..."); falls back to a plain paragraph per blank-line block.
  function formatPromptHTML(text){
    var blocks = String(text).split(/\n{2,}/);
    return blocks.map(function(block){
      var m;

      m = block.match(/^##\s*([A-Za-z][A-Za-z0-9 _-]*)\n([\s\S]*)$/);
      if(m){
        return '<div class="prompt-section"><div class="prompt-label">'+escapeHtml(m[1].trim())+'</div><div class="prompt-body">'+escapeHtml(m[2].trim())+'</div></div>';
      }

      m = block.match(/^(Who|What|How|Why)\?\s*[—–-]\s*([\s\S]*)$/);
      if(m){
        return '<div class="prompt-section"><div class="prompt-label">'+escapeHtml(m[1])+'?</div><div class="prompt-body">'+escapeHtml(m[2].trim())+'</div></div>';
      }

      m = block.match(/^(\d+)\.\s+([^—–\n]+)[—–]\s*([\s\S]*)$/);
      if(m){
        return '<div class="prompt-section"><div class="prompt-label">'+escapeHtml(m[1])+'. '+escapeHtml(m[2].trim())+'</div><div class="prompt-body">'+escapeHtml(m[3].trim())+'</div></div>';
      }

      m = block.match(/^Template\s*[—–-]\s*([\s\S]*)$/);
      if(m){
        return '<div class="prompt-section prompt-template"><div class="prompt-label">Template</div><div class="prompt-body">'+escapeHtml(m[1].trim())+'</div></div>';
      }

      m = block.match(/^(Role|Context|Purpose|Constraint|Next)\s*:\s*([\s\S]*)$/);
      if(m){
        return '<div class="prompt-section"><div class="prompt-label">'+escapeHtml(m[1])+'</div><div class="prompt-body">'+escapeHtml(m[2].trim())+'</div></div>';
      }

      return '<p class="prompt-para">'+escapeHtml(block)+'</p>';
    }).join('');
  }

  function allTags(){
    var set = {};
    state.forEach(function(e){ (e.tags||[]).forEach(function(t){ set[t] = (set[t]||0)+1; }); });
    return Object.keys(set).sort().map(function(t){ return {tag:t, n:set[t]}; });
  }

  // Bilingual content helpers: an entry may carry usecase_es/prompt_es
  // alongside the base (English) usecase/prompt. When present, these pick
  // the version matching the current UI language, falling back to the
  // base field so entries without a translation still render correctly.
  function entryUsecase(e){
    if(ui.lang === 'es' && e.usecase_es) return e.usecase_es;
    return e.usecase || '';
  }
  function entryPrompt(e){
    if(ui.lang === 'es' && e.prompt_es) return e.prompt_es;
    return e.prompt || '';
  }

  function matches(entry, q){
    if(!q) return true;
    q = q.toLowerCase();
    var c = catByKey[entry.cat];
    var catText = c ? [c.label.en, c.label.es].filter(Boolean).join(' ') : entry.cat;
    var hay = [entry.term, entry.usecase, entry.usecase_es, entry.prompt, entry.prompt_es, (entry.tags||[]).join(' '), catText]
      .filter(Boolean).join(' ').toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function filtered(){
    var q = ui.query.trim();
    var list = state.filter(function(e){ return matches(e, q); });
    if(ui.view === 'category' && ui.activeCat){ list = list.filter(function(e){ return e.cat === ui.activeCat; }); }
    if(ui.view === 'tags' && ui.activeTag){ list = list.filter(function(e){ return (e.tags||[]).indexOf(ui.activeTag) !== -1; }); }
    return list;
  }

  // Moves entry `draggedId` next to `targetId` (before or after it),
  // preserving every other category's relative order untouched. Both
  // entries must share a category — reordering across categories by drag
  // isn't offered (the drag handle only appears within a single category).
  function reorderEntry(draggedId, targetId, placeBefore){
    if(draggedId === targetId) return;
    var fromIdx = state.findIndex(function(e){ return e.id === draggedId; });
    var targetIdx = state.findIndex(function(e){ return e.id === targetId; });
    if(fromIdx < 0 || targetIdx < 0) return;
    if(state[fromIdx].cat !== state[targetIdx].cat) return;
    var dragged = state[fromIdx];
    state.splice(fromIdx, 1);
    var newTargetIdx = state.findIndex(function(e){ return e.id === targetId; });
    var insertAt = placeBefore ? newTargetIdx : newTargetIdx + 1;
    state.splice(insertAt, 0, dragged);
    render();
    scheduleSave();
  }

  // ---------- render pieces ----------
  function renderViewSwitch(){
    var views = [
      {key:'category', label:tr('viewCategory')},
      {key:'alpha', label:tr('viewAlpha')},
      {key:'tags', label:tr('viewTags')}
    ];
    return views.map(function(v){
      return '<button data-view="'+v.key+'" class="'+(ui.view===v.key?'active':'')+'">'+escapeHtml(v.label)+'</button>';
    }).join('');
  }

  function renderCatList(){
    if(ui.view === 'tags'){
      var tags = allTags();
      var html = '<button data-cat="__all" class="'+(!ui.activeTag?'active':'')+'"><span class="tag">'+escapeHtml(tr('allTag'))+'</span>'+escapeHtml(tr('allTags'))+'<span class="n">'+state.length+'</span></button>';
      html += tags.map(function(t){
        return '<button data-tag="'+escapeHtml(t.tag)+'" class="'+(ui.activeTag===t.tag?'active':'')+'"><span class="tag">#</span>'+escapeHtml(t.tag)+'<span class="n">'+t.n+'</span></button>';
      }).join('');
      return html;
    }
    var html = '<button data-cat="__all" class="'+(!ui.activeCat?'active':'')+'"><span class="tag">'+escapeHtml(tr('allTag'))+'</span>'+escapeHtml(tr('allEntries'))+'<span class="n">'+state.length+'</span></button>';
    html += CATEGORIES.map(function(c){
      var n = state.filter(function(e){ return e.cat===c.key; }).length;
      return '<button data-cat="'+c.key+'" class="'+(ui.activeCat===c.key?'active':'')+'" style="--cat-color:'+c.color+'"><span class="tag" style="background:'+c.color+'22;color:'+c.color+'">'+c.code+'</span>'+escapeHtml(catLabel(c))+'<span class="n">'+n+'</span></button>';
    }).join('');
    return html;
  }

  function entryCard(e, opts){
    opts = opts || {};
    var open = ui.openId === e.id;
    var cat = catByKey[e.cat] || {label:{en:e.cat,es:e.cat}, code:'—'};
    // Drag-to-reorder is only offered while viewing a single category — in
    // the "All entries" grouped view (every category at once) it's off.
    var canReorder = isEditMode && ui.view === 'category' && !!ui.activeCat;
    var dragHandle = canReorder ?
      '<span class="drag-handle" draggable="true" title="'+escapeHtml(tr('dragToReorder'))+'">&#8942;&#8942;</span>'
      : '';
    return (
      '<div class="entry'+(open?' open':'')+'" data-id="'+e.id+'" data-cat="'+e.cat+'"'+(canReorder?' draggable="false"':'')+'>'+
        '<div class="entry-head">'+
          '<span class="entry-term">'+escapeHtml(e.term)+'</span>'+
          '<span class="entry-cat">'+cat.code+' · '+escapeHtml(catLabel(cat))+'</span>'+
          dragHandle +
        '</div>'+
        '<p class="entry-usecase">'+escapeHtml(entryUsecase(e))+'</p>'+
        '<div class="entry-tags">'+(e.tags||[]).map(function(t){ return '<span>#'+escapeHtml(t)+'</span>'; }).join('')+'</div>'+
        '<div class="entry-body">'+
          '<div class="entry-prompt">'+formatPromptHTML(entryPrompt(e))+'</div>'+
          '<div class="entry-actions">'+
            '<button class="copy" data-act="copy" data-id="'+e.id+'">'+escapeHtml(tr('copy'))+'</button>'+
            (isEditMode ?
              '<button class="edit" data-act="edit" data-id="'+e.id+'">'+escapeHtml(tr('edit'))+'</button>'+
              '<button class="del" data-act="del" data-id="'+e.id+'">'+escapeHtml(tr('del'))+'</button>'
              : '') +
          '</div>'+
          (ui.pendingDelete===e.id ?
            '<div class="confirm-box">'+escapeHtml(tr('deleteConfirm'))+
              '<button class="yes" data-act="del-confirm" data-id="'+e.id+'">'+escapeHtml(tr('deleteYes'))+'</button>'+
              '<button class="no" data-act="del-cancel" data-id="'+e.id+'">'+escapeHtml(tr('deleteNo'))+'</button>'+
            '</div>' : '') +
        '</div>'+
      '</div>'
    );
  }

  function renderResults(){
    var list = filtered();
    var n = list.length;
    document.getElementById('result-count').textContent = n + ' ' + (n===1 ? tr('entrySingular') : tr('entryPlural'));

    var titleEl = document.getElementById('view-title');
    var label = tr('allEntries');
    if(ui.view==='category') label = ui.activeCat ? catLabelByKey(ui.activeCat) : tr('allEntries');
    if(ui.view==='alpha') label = tr('alphaIndexTitle');
    if(ui.view==='tags') label = ui.activeTag ? '#'+ui.activeTag : tr('allTags');
    titleEl.innerHTML = '<div class="view-title"><h2>'+escapeHtml(label)+'</h2><span class="sub mono">'+list.length+' / '+state.length+'</span></div>';

    var out = '';
    if(!list.length){
      out = '<div class="empty-state"><div class="glyph">§</div>'+escapeHtml(tr(isEditMode ? 'emptyState' : 'emptyStatePublic'))+'</div>';
    } else if(ui.view === 'alpha'){
      var sorted = list.slice().sort(function(a,b){ return a.term.localeCompare(b.term); });
      var lastLetter = '';
      sorted.forEach(function(e){
        var letter = (e.term[0]||'#').toUpperCase();
        if(letter !== lastLetter){ out += '<div class="letter-heading">'+letter+'</div>'; lastLetter = letter; }
        out += entryCard(e);
      });
    } else if(ui.view === 'category' && !ui.activeCat){
      CATEGORIES.forEach(function(c){
        var group = list.filter(function(e){ return e.cat === c.key; });
        if(!group.length) return;
        out += '<div class="cat-heading"><span class="tag">'+c.code+'</span><h3>'+escapeHtml(catLabel(c))+'</h3><span class="n">'+group.length+'</span></div>';
        group.forEach(function(e, i){ out += entryCard(e, {isFirst:i===0, isLast:i===group.length-1}); });
      });
    } else if(ui.view === 'category' && ui.activeCat){
      list.forEach(function(e, i){ out += entryCard(e, {isFirst:i===0, isLast:i===list.length-1}); });
    } else {
      list.slice().sort(function(a,b){ return a.term.localeCompare(b.term); }).forEach(function(e){ out += entryCard(e); });
    }
    document.getElementById('results').innerHTML = out;
  }

  function applyStaticText(){
    document.getElementById('brand-sub').textContent = tr('subtitle');
    document.getElementById('sources-note-text').textContent = tr('sourcesNote');
    document.getElementById('browse-label').textContent = tr('browseLabel');
    document.getElementById('categories-label').textContent = tr('categoriesLabel');
    document.getElementById('open-add').textContent = tr('newEntry');
    document.getElementById('open-add').hidden = !isEditMode;
    document.getElementById('storage-note-text').textContent = tr(isEditMode ? 'storageNote' : 'storageNotePublic');
    var homeLinkEl = document.getElementById('site-home-link');
    if(homeLinkEl) homeLinkEl.textContent = tr('homeLink');
    var editBadgeEl = document.getElementById('edit-mode-badge');
    if(editBadgeEl){
      editBadgeEl.hidden = !isEditMode;
      editBadgeEl.textContent = tr('editModeBadge');
    }
    document.getElementById('lang-toggle').textContent = tr('langToggle');
    document.getElementById('refresh-btn-label').textContent = tr('refreshBtn');
    var searchInput = document.getElementById('search-input');
    searchInput.placeholder = tr('searchPlaceholder');
    if(searchInput.value !== ui.query) searchInput.value = ui.query;
    document.getElementById('label-term').textContent = tr('fieldTerm');
    document.getElementById('label-cat').textContent = tr('fieldCategory');
    document.getElementById('label-tags').textContent = tr('fieldTags');
    document.getElementById('label-usecase').textContent = tr('fieldUsecase');
    document.getElementById('label-prompt').textContent = tr('fieldPrompt');
    fTerm.placeholder = tr('fieldTermPlaceholder');
    fTags.placeholder = tr('fieldTagsPlaceholder');
    fUsecase.placeholder = tr('fieldUsecasePlaceholder');
    fPrompt.placeholder = tr('fieldPromptPlaceholder');
    document.getElementById('modal-cancel').textContent = tr('cancel');
    document.getElementById('modal-save').textContent = tr('saveEntry');
    document.getElementById('modal-title').textContent = ui.editId ? tr('modalEditTitle') : tr('modalNewTitle');
    fCat.innerHTML = CATEGORIES.map(function(c){ return '<option value="'+c.key+'">'+escapeHtml(catLabel(c))+'</option>'; }).join('');
    if(ui.editId){ var cur = state.find(function(e){ return e.id===ui.editId; }); if(cur) fCat.value = cur.cat; }
    updateSaveBar();
  }

  function render(){
    document.getElementById('entry-count-badge').textContent = String(state.length).padStart(2,'0');
    document.getElementById('view-switch').innerHTML = renderViewSwitch();
    document.getElementById('cat-list').innerHTML = renderCatList();
    applyStaticText();
    renderResults();
  }

  // ---------- localStorage persistence ----------
  var saveStatusEl = null;
  var publishTimer = null;
  var savedHideTimer = null;
  var saveState = 'idle'; // idle | dirty | saving | saved | error
  var lastSaveErr = '';

  var saveBarEl = document.getElementById('save-bar');
  var saveBarTextEl = document.getElementById('save-bar-text');
  var saveNowBtnEl = document.getElementById('save-now-btn');

  function updateSaveBar(){
    if(!saveBarEl) return;
    saveBarEl.classList.remove('is-dirty','is-saving','is-saved','is-error');
    if(saveState === 'idle'){
      saveBarEl.hidden = true;
      return;
    }
    saveBarEl.hidden = false;
    if(saveState === 'dirty'){
      saveBarEl.classList.add('is-dirty');
      saveBarTextEl.textContent = tr('unsavedStatus');
      saveNowBtnEl.hidden = false;
      saveNowBtnEl.textContent = tr('saveNowBtn');
    } else if(saveState === 'saving'){
      saveBarEl.classList.add('is-saving');
      saveBarTextEl.textContent = tr('savingStatus');
      saveNowBtnEl.hidden = true;
    } else if(saveState === 'saved'){
      saveBarEl.classList.add('is-saved');
      saveBarTextEl.textContent = tr('savedStatus');
      saveNowBtnEl.hidden = true;
    } else if(saveState === 'error'){
      saveBarEl.classList.add('is-error');
      saveBarTextEl.textContent = tr('notSavedStatus') + lastSaveErr;
      saveNowBtnEl.hidden = false;
      saveNowBtnEl.textContent = tr('saveNowBtn');
    }
  }

  // Marks the page as having unsaved changes and shows the save bar
  // immediately; the actual write still runs on its own debounce (or
  // right away if the viewer clicks "Save").
  function markDirty(){
    saveState = 'dirty';
    clearTimeout(savedHideTimer);
    updateSaveBar();
  }

  function persistEntries(){
    if(!isEditMode) return;
    saveState = 'saving';
    updateSaveBar();
    if(saveStatusEl) saveStatusEl.textContent = tr('savingStatus');
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      saveState = 'saved';
      updateSaveBar();
      if(saveStatusEl){
        saveStatusEl.textContent = tr('savedStatus');
        setTimeout(function(){ if(saveStatusEl) saveStatusEl.textContent=''; }, 1500);
      }
      clearTimeout(savedHideTimer);
      savedHideTimer = setTimeout(function(){
        if(saveState === 'saved'){ saveState = 'idle'; updateSaveBar(); }
      }, 1800);
    } catch(err){
      lastSaveErr = (err && (err.name || err.message)) || 'error';
      saveState = 'error';
      updateSaveBar();
      if(saveStatusEl) saveStatusEl.textContent = tr('notSavedStatus') + lastSaveErr;
    }
  }

  function scheduleSave(){
    if(!isEditMode) return;
    markDirty();
    clearTimeout(publishTimer);
    publishTimer = setTimeout(persistEntries, 400);
  }

  function saveNow(){
    clearTimeout(publishTimer);
    persistEntries();
  }

  if(saveNowBtnEl){ saveNowBtnEl.addEventListener('click', saveNow); }

  // ---------- events ----------
  // Mobile off-canvas rail (see the drawer CSS): open/close via a class
  // on <body> so the same toggle works whether the media query matched
  // on width or on touch/pointer capability.
  var menuToggleEl = document.getElementById('menu-toggle');
  var railBackdropEl = document.getElementById('rail-backdrop');
  function closeRailDrawer(){ document.body.classList.remove('rail-open'); }
  function openRailDrawer(){ document.body.classList.add('rail-open'); }
  if(menuToggleEl){
    menuToggleEl.addEventListener('click', function(){
      document.body.classList.toggle('rail-open');
    });
  }
  if(railBackdropEl){ railBackdropEl.addEventListener('click', closeRailDrawer); }
  document.addEventListener('keydown', function(ev){ if(ev.key === 'Escape') closeRailDrawer(); });

  document.getElementById('view-switch').addEventListener('click', function(ev){
    var b = ev.target.closest('button[data-view]');
    if(!b) return;
    ui.view = b.getAttribute('data-view');
    ui.activeCat = null; ui.activeTag = null; ui.openId = null;
    closeRailDrawer();
    render();
  });

  document.getElementById('cat-list').addEventListener('click', function(ev){
    var b = ev.target.closest('button');
    if(!b) return;
    if(b.hasAttribute('data-tag')){
      ui.activeTag = b.getAttribute('data-tag');
    } else {
      var v = b.getAttribute('data-cat');
      ui.activeCat = v === '__all' ? null : v;
      ui.activeTag = null;
    }
    closeRailDrawer();
    render();
  });

  document.getElementById('search-input').addEventListener('input', function(ev){
    ui.query = ev.target.value;
    renderResults();
  });

  document.getElementById('results').addEventListener('click', function(ev){
    var actBtn = ev.target.closest('[data-act]');
    if(actBtn){
      var id = actBtn.getAttribute('data-id');
      var act = actBtn.getAttribute('data-act');
      var entry = state.find(function(e){ return e.id===id; });
      if(act === 'copy' && entry){
        navigator.clipboard.writeText(entryPrompt(entry)).then(function(){
          actBtn.textContent = tr('copied');
          actBtn.classList.add('copied');
          setTimeout(function(){ actBtn.textContent = tr('copy'); actBtn.classList.remove('copied'); }, 1400);
        });
      } else if(act === 'edit' && entry){
        if(!isEditMode) return;
        openModal(entry);
      } else if(act === 'del'){
        if(!isEditMode) return;
        ui.pendingDelete = id;
        renderResults();
      } else if(act === 'del-cancel'){
        ui.pendingDelete = null;
        renderResults();
      } else if(act === 'del-confirm'){
        state = state.filter(function(e){ return e.id !== id; });
        ui.pendingDelete = null;
        render();
        scheduleSave();
      }
      return;
    }
    if(ev.target.closest('.drag-handle')) return;
    var card = ev.target.closest('.entry');
    if(card){
      var cid = card.getAttribute('data-id');
      ui.openId = (ui.openId === cid) ? null : cid;
      renderResults();
    }
  });

  // ---------- drag to reorder (within a single category view only) ----------
  var resultsEl = document.getElementById('results');
  var dragId = null;
  var dragCat = null;

  function clearDragIndicators(){
    var marked = resultsEl.querySelectorAll('.drag-over-top, .drag-over-bottom');
    for(var i=0; i<marked.length; i++){ marked[i].classList.remove('drag-over-top', 'drag-over-bottom'); }
  }

  function cleanupDrag(){
    var dragging = resultsEl.querySelectorAll('.dragging');
    for(var i=0; i<dragging.length; i++){ dragging[i].classList.remove('dragging'); }
    clearDragIndicators();
    dragId = null;
    dragCat = null;
  }

  resultsEl.addEventListener('dragstart', function(ev){
    var handle = ev.target.closest('.drag-handle');
    if(!handle) return;
    var card = handle.closest('.entry');
    if(!card) return;
    dragId = card.getAttribute('data-id');
    dragCat = card.getAttribute('data-cat');
    ev.dataTransfer.effectAllowed = 'move';
    try { ev.dataTransfer.setData('text/plain', dragId); } catch(err){}
    requestAnimationFrame(function(){ card.classList.add('dragging'); });
  });

  resultsEl.addEventListener('dragover', function(ev){
    if(!dragId) return;
    var card = ev.target.closest('.entry');
    if(!card || card.getAttribute('data-id') === dragId || card.getAttribute('data-cat') !== dragCat){
      return;
    }
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
    var rect = card.getBoundingClientRect();
    var before = (ev.clientY - rect.top) < (rect.height / 2);
    clearDragIndicators();
    card.classList.add(before ? 'drag-over-top' : 'drag-over-bottom');
    card.setAttribute('data-drag-before', before ? '1' : '0');
  });

  resultsEl.addEventListener('drop', function(ev){
    if(!dragId) return;
    var card = ev.target.closest('.entry');
    if(card && card.getAttribute('data-cat') === dragCat){
      ev.preventDefault();
      var targetId = card.getAttribute('data-id');
      var placeBefore = card.getAttribute('data-drag-before') === '1';
      reorderEntry(dragId, targetId, placeBefore);
    }
    cleanupDrag();
  });

  resultsEl.addEventListener('dragend', cleanupDrag);

  // ---------- modal ----------
  var overlayEl = document.getElementById('overlay');
  var fTerm = document.getElementById('f-term');
  var fCat = document.getElementById('f-cat');
  var fTags = document.getElementById('f-tags');
  var fUsecase = document.getElementById('f-usecase');
  var fPrompt = document.getElementById('f-prompt');
  saveStatusEl = document.getElementById('save-status');

  fCat.innerHTML = CATEGORIES.map(function(c){ return '<option value="'+c.key+'">'+escapeHtml(catLabel(c))+'</option>'; }).join('');

  function openModal(entry){
    if(!isEditMode) return;
    ui.editId = entry ? entry.id : null;
    document.getElementById('modal-title').textContent = entry ? tr('modalEditTitle') : tr('modalNewTitle');
    fTerm.value = entry ? entry.term : '';
    fCat.value = entry ? entry.cat : CATEGORIES[0].key;
    fTags.value = entry ? (entry.tags||[]).join(', ') : '';
    fUsecase.value = entry ? (entry.usecase||'') : '';
    fPrompt.value = entry ? entry.prompt : '';
    saveStatusEl.textContent = '';
    overlayEl.classList.add('show');
    setTimeout(function(){ fTerm.focus(); }, 30);
  }
  function closeModal(){ overlayEl.classList.remove('show'); ui.editId = null; }

  document.getElementById('open-add').addEventListener('click', function(){
    if(!isEditMode) return;
    openModal(null);
  });
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  overlayEl.addEventListener('click', function(ev){ if(ev.target === overlayEl) closeModal(); });

  document.getElementById('modal-save').addEventListener('click', function(){
    if(!isEditMode) return;
    var term = fTerm.value.trim();
    var prompt = fPrompt.value.trim();
    if(!term || !prompt){
      saveStatusEl.textContent = tr('requiredStatus');
      return;
    }
    var tags = fTags.value.split(',').map(function(t){ return t.trim(); }).filter(Boolean);
    var payload = { term: term, cat: fCat.value, tags: tags, usecase: fUsecase.value.trim(), prompt: prompt };

    if(ui.editId){
      var idx = state.findIndex(function(e){ return e.id === ui.editId; });
      if(idx !== -1) state[idx] = Object.assign({ id: ui.editId }, payload);
    } else {
      state.push(Object.assign({ id: 'e'+Date.now().toString(36)+Math.random().toString(36).slice(2,6) }, payload));
    }
    closeModal();
    render();
    scheduleSave();
  });

  document.addEventListener('keydown', function(ev){
    if(ev.key === 'Escape' && overlayEl.classList.contains('show')) closeModal();
  });

  document.getElementById('lang-toggle').addEventListener('click', function(){
    setLang(ui.lang === 'es' ? 'en' : 'es');
  });

  document.addEventListener('monkyfi:langchange', function(ev){
    var code = ev && ev.detail && ev.detail.lang;
    setLang(code === 'ES' ? 'es' : 'en');
  });

  document.getElementById('refresh-btn').addEventListener('click', function(){
    var btn = this;
    btn.classList.add('is-spinning');
    stashUiState();
    setTimeout(function(){ window.location.reload(); }, 150);
  });

  render();
})();