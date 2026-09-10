const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, '../server/data/questions.json');
const existing = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

const newQuestions = [
  // AI & ML
  {
    id: "q-aiml-beg-1",
    competencyId: "ai_ml",
    difficulty: 1,
    scenario: "An analyst in the National Accounts Division is evaluating techniques to flag anomalous enterprise revenue entries in the Annual Survey of Industries (ASI).",
    question: "Which machine learning approach is best suited for identifying anomalous records without pre-labeled fraudulent examples?",
    options: [
      "Unsupervised Anomaly Detection (e.g. Isolation Forests / One-Class SVM)",
      "Supervised Binary Logistic Regression with cross-validation",
      "K-Nearest Neighbors using 100% labeled training samples",
      "Simple Linear Extrapolation based on nominal GDP"
    ],
    correctAnswer: 0,
    explanation: "Unsupervised anomaly detection techniques like Isolation Forests isolate anomalies by exploiting the fact that outliers are few and distinct, without requiring labeled ground truth data.",
    keyConcept: "Unsupervised Anomaly Detection"
  },
  {
    id: "q-aiml-int-1",
    competencyId: "ai_ml",
    difficulty: 2,
    scenario: "In an automated survey listing pipeline, free-text descriptions of occupations must be coded into 3-digit National Classification of Occupations (NCO) codes.",
    question: "Which NLP technique represents modern best practice for automated text classification of survey response strings?",
    options: [
      "Pretrained Transformer embeddings fine-tuned with a classification head on historic NCO registries",
      "Exact string matching using SQL LIKE queries with wildcards",
      "Counting total characters and sorting alphabetically",
      "Replacing all vowel occurrences with statistical weights"
    ],
    correctAnswer: 0,
    explanation: "Pretrained transformer models capture semantic context, handling spelling variations and colloquial descriptions far better than rigid lexical lookups.",
    keyConcept: "NLP Semantic Classification for Occupation Codes"
  },
  {
    id: "q-aiml-adv-1",
    competencyId: "ai_ml",
    difficulty: 3,
    scenario: "A predictive model trained on urban PLFS microdata experiences high prediction error when deployed to rural tribal districts due to feature distribution shifts.",
    question: "What statistical phenomenon is causing this degradation, and how should it be mitigated?",
    options: [
      "Covariate shift (dataset drift); mitigate via importance weighting or domain adaptation on stratified rural sampling units.",
      "Target leakage; mitigate by deleting all demographic predictor variables.",
      "Over-stratification; mitigate by eliminating sampling weights from the training set.",
      "Underfitting; mitigate by setting all regularization parameters to zero."
    ],
    correctAnswer: 0,
    explanation: "When the input distribution P(X) changes between training and deployment while P(Y|X) remains relatively stable, covariate shift occurs. Domain adaptation and density ratio reweighting help calibrate the model.",
    keyConcept: "Covariate Shift & Domain Adaptation in Microdata"
  },

  // National Accounts & GVA
  {
    id: "q-na-beg-1",
    competencyId: "national_accounts",
    difficulty: 1,
    scenario: "During quarterly National Income estimation, an officer computes Gross Value Added (GVA) at basic prices for the manufacturing sector.",
    question: "What is the official relationship between GVA at Basic Prices and GDP at Market Prices in the Indian System of National Accounts (SNA 2008)?",
    options: [
      "GDP at Market Prices = GVA at Basic Prices + Product Taxes - Product Subsidies",
      "GDP at Market Prices = GVA at Basic Prices - Production Taxes + Production Subsidies",
      "GDP at Market Prices = GVA at Basic Prices + Intermediate Consumption",
      "GDP at Market Prices = GVA at Basic Prices / Total Population"
    ],
    correctAnswer: 0,
    explanation: "Under SNA 2008 adopted by MoSPI, GDP at Market Prices equals GVA at Basic Prices plus net taxes on products (Product Taxes minus Product Subsidies).",
    keyConcept: "GVA to GDP Transition Formula"
  },
  {
    id: "q-na-int-1",
    competencyId: "national_accounts",
    difficulty: 2,
    scenario: "To estimate real quarterly GVA growth in the manufacturing sector, intermediate inputs and gross output prices are inflating at divergent rates.",
    question: "Which deflation method represents the international gold standard to avoid distorted real value added estimates?",
    options: [
      "Double Deflation (deflating gross output by output price index and inputs by input price index separately)",
      "Single Indicator Extrapolation using CPI headline inflation only",
      "Deflating intermediate consumption using the US Dollar exchange rate",
      "Averaging the Wholesale Price Index (WPI) and Consumer Price Index (CPI) linearly"
    ],
    correctAnswer: 0,
    explanation: "Double deflation deflates gross output with an appropriate output price index and intermediate inputs with dedicated input price indices, ensuring real GVA reflects true productivity.",
    keyConcept: "Double Deflation Methodology in SNA"
  },
  {
    id: "q-na-adv-1",
    competencyId: "national_accounts",
    difficulty: 3,
    scenario: "In compiling Supply and Use Tables (SUT) for an Indian base year revision, the total supply of domestic products at basic prices plus imports does not equal total uses at purchasers' prices.",
    question: "Which valuation adjustments are mathematically required to transition from Supply at basic prices to Use at purchasers' prices?",
    options: [
      "Add Trade and Transport Margins, add Net Taxes on Products (Taxes minus Subsidies on Products).",
      "Subtract Intermediate Consumption and add Gross Capital Formation.",
      "Add Net Factor Income from Abroad and subtract Depreciation.",
      "Multiply by the purchasing power parity (PPP) conversion factor."
    ],
    correctAnswer: 0,
    explanation: "Supply at basic prices is transformed to purchasers' prices by adding trade and transport margins and net taxes on products (product taxes minus product subsidies).",
    keyConcept: "Supply and Use Table (SUT) Valuation Balancing"
  },

  // Survey Design
  {
    id: "q-sd-beg-1",
    competencyId: "survey_design",
    difficulty: 1,
    scenario: "A survey team is designing an all-India household survey on domestic tourism expenditure.",
    question: "What is the primary function of establishing a comprehensive 'Sampling Frame' before sample selection?",
    options: [
      "To provide an exhaustive, non-overlapping list of all target population units from which sample units can be selected with known probabilities.",
      "To calculate the total budget expenditure of the enumerator field teams.",
      "To formulate the final tabular graphics for the press release.",
      "To train enumerators on conversational interview skills."
    ],
    correctAnswer: 0,
    explanation: "A sampling frame is the operational representation of the target population consisting of finite, identifiable units that can be sampled probabilistically.",
    keyConcept: "Sampling Frame Formulation"
  },
  {
    id: "q-sd-int-1",
    competencyId: "survey_design",
    difficulty: 2,
    scenario: "In designing the schedule for a socio-economic survey, an analyst needs to minimize non-sampling errors arising from respondent recall decay.",
    question: "Which questionnaire design technique is most effective for measuring episodic household medical expenditures?",
    options: [
      "Using dual reference periods (e.g. 30 days for minor outpatient care vs. 365 days for major inpatient hospitalizations)",
      "Asking respondents to estimate their lifetime health expenditures in a single question",
      "Relying exclusively on 24-hour telephone recalls",
      "Omitting all expenditure amounts and recording only binary illness occurrence"
    ],
    correctAnswer: 0,
    explanation: "Different recall horizons (short for frequent/small items, 365 days for infrequent/large institutional hospitalizations) minimize recall bias and telescoping errors.",
    keyConcept: "Reference Period Optimization & Recall Bias Mitigation"
  },
  {
    id: "q-sd-adv-1",
    competencyId: "survey_design",
    difficulty: 3,
    scenario: "In a nationwide multi-subject survey, several primary sampling units (villages/urban frames) have grown 10-fold in population since the last Census frame was published.",
    question: "Which survey design protocol is officially mandated in NSSO methodology to prevent severe selection bias in large PSUs?",
    options: [
      "Sub-division of the large FSU into Hamlet-Groups (rural) or Sub-Blocks (urban) followed by equal probability random selection of sample hamlet-groups.",
      "Excluding the overgrown village completely and substituting with an uninhabited hamlet.",
      "Doubling the sampling interval without updating household counts.",
      "Surveying all 10,000 households regardless of time or operational limits."
    ],
    correctAnswer: 0,
    explanation: "NSSO guidelines mandate dividing large FSUs into hamlet-groups / sub-blocks of approximately equal population size, randomly selecting 2 (or more) sample HGs/SBs for listing.",
    keyConcept: "Hamlet-Group & Sub-Block Selection Protocol"
  },

  // Data Quality Frameworks
  {
    id: "q-dqf-beg-1",
    competencyId: "data_quality_frameworks",
    difficulty: 1,
    scenario: "An enumerator submits a CAPI record where a 7-year-old child is recorded as 'Employed full-time as an ISS Statistical Officer with a Ph.D.'.",
    question: "Under standard National Quality Assurance Frameworks (NQAF), this error is classified as which validation violation?",
    options: [
      "Logical Consistency / Cross-Field Validation Rule Violation",
      "Sampling Stratification Variance Error",
      "Non-response Imputation Bias",
      "Base Year Weight Inflation"
    ],
    correctAnswer: 0,
    explanation: "Logical consistency rules cross-validate interdependent fields (e.g., age vs educational attainment vs employment designation) to trap invalid combinations.",
    keyConcept: "Cross-Field Logical Validation"
  },
  {
    id: "q-dqf-int-1",
    competencyId: "data_quality_frameworks",
    difficulty: 2,
    scenario: "A survey dataset contains 4% missing values in a non-critical consumption sub-category due to random enumerator omission.",
    question: "Under official statistical guidelines, which imputation technique preserves the original empirical variance distribution without artificially suppressing standard deviations?",
    options: [
      "Hot-deck donor imputation matching on similar household strata",
      "Replacing all missing values with zero",
      "Replacing all missing values with the overall national grand mean",
      "Deleting all households that have any single missing attribute"
    ],
    correctAnswer: 0,
    explanation: "Hot-deck imputation substitutes values from a donor record within the same imputation cell/stratum, preserving the observed microdata variance better than mean substitution.",
    keyConcept: "Hot-Deck Imputation & Variance Preservation"
  },

  // Price Statistics
  {
    id: "q-price-beg-1",
    competencyId: "price_statistics",
    difficulty: 1,
    scenario: "In computing elementary price indices across municipal markets for the Consumer Price Index (CPI), price quotations from multiple outlets are collected.",
    question: "Which formula is recommended by international CPI manuals and adopted for aggregating elementary outlet price quotations to eliminate index bias?",
    options: [
      "Jevons Index (Geometric Mean of Price Relatives)",
      "Carli Index (Arithmetic Mean of Price Relatives)",
      "Dutot Index using nominal maximum price only",
      "Simple Median of highest prices"
    ],
    correctAnswer: 0,
    explanation: "The Jevons index (geometric mean) satisfies the transitivity and time-reversal tests, avoiding the upward bias inherent in the arithmetic Carli formula.",
    keyConcept: "Jevons Elementary Aggregation Formula"
  },
  {
    id: "q-price-int-1",
    competencyId: "price_statistics",
    difficulty: 2,
    scenario: "A selected branded smartphone in the CPI electronics basket is discontinued by the manufacturer and replaced in shops by an upgraded model with double the memory.",
    question: "How should a Price Statistics Officer handle this product change to avoid distorting pure price inflation?",
    options: [
      "Apply Hedonic Quality Adjustment or matched-model linking to separate the pure price change from the quality enhancement.",
      "Record the entire price difference as pure consumer inflation.",
      "Drop the communications item from the national basket completely.",
      "Assume the price of the new model is zero."
    ],
    correctAnswer: 0,
    explanation: "Quality adjustment ensures that price increases due to superior physical/technical specifications are not mistaken for pure monetary inflation.",
    keyConcept: "Hedonic Quality Adjustment & Matched Modeling"
  },

  // Statistical Analysis & Inference
  {
    id: "q-stat-beg-1",
    competencyId: "statistical_analysis",
    difficulty: 1,
    scenario: "A statistical officer evaluates whether the observed difference in literacy rates between two districts in a sample survey is statistically significant.",
    question: "What does a p-value of 0.02 indicate in standard hypothesis testing at a 5% significance level (alpha = 0.05)?",
    options: [
      "Reject the Null Hypothesis; the probability of observing a difference this extreme under the null hypothesis is only 2%, indicating significant difference.",
      "Accept the Null Hypothesis; the literacy rates are provably identical.",
      "The test is inconclusive because the p-value is less than 0.50.",
      "There is a 98% error rate in the data collection process."
    ],
    correctAnswer: 0,
    explanation: "When p < alpha (0.02 < 0.05), we reject the null hypothesis of equal parameters in favor of the alternative hypothesis.",
    keyConcept: "P-Value Interpretation & Hypothesis Testing"
  },
  {
    id: "q-stat-int-1",
    competencyId: "statistical_analysis",
    difficulty: 2,
    scenario: "In estimating wage regression models using national survey microdata, individuals who are not in the labour force have unobserved wages.",
    question: "Running ordinary least squares (OLS) only on working individuals introduces which statistical bias, and which model corrects for it?",
    options: [
      "Sample Selection Bias; corrected via Heckman's Two-Step Selection Model (Heckit).",
      "Multicollinearity; corrected via Ridge Regression penalty.",
      "Heteroscedasticity; corrected via moving average smoothing.",
      "Serial correlation; corrected via Durbin-Watson statistic."
    ],
    correctAnswer: 0,
    explanation: "Heckman's selection model estimates a selection equation followed by an outcome regression containing the Inverse Mills Ratio, eliminating sample selection bias.",
    keyConcept: "Heckman Two-Step Selection Correction"
  },

  // R Stats & Econometrics
  {
    id: "q-r-int-1",
    competencyId: "r_stats",
    difficulty: 2,
    scenario: "An analyst is analyzing stratified complex survey microdata in R using the `survey` package.",
    question: "Which R code snippet correctly specifies a two-stage cluster design with survey weights and finite population correction?",
    options: [
      "svydesign(id = ~fsu_id + ssu_id, strata = ~stratum, weights = ~multi_weight, fpc = ~fpc1 + fpc2, data = df)",
      "lm(income ~ education, weights = multi_weight, data = df)",
      "ggplot(df, aes(x = stratum, y = income)) + geom_point()",
      "summary(aov(income ~ fsu_id, data = df))"
    ],
    correctAnswer: 0,
    explanation: "The `svydesign()` function in R's `survey` library explicitly models cluster IDs, stratification, sampling weights, and finite population corrections.",
    keyConcept: "Complex Survey Design Modeling in R"
  },

  // Data Visualization & Dashboards
  {
    id: "q-vis-beg-1",
    competencyId: "data_visualization",
    difficulty: 1,
    scenario: "A division officer is preparing an executive visual summary comparing poverty rates across 28 states and 8 UTs.",
    question: "Which visual format conveys geographical variation and spatial clustering most effectively for policymakers?",
    options: [
      "Choropleth Map with standardized color gradients and equal interval/quantile breaks",
      "3D Exploded Pie Chart with 36 distinct slices",
      "Radar chart with 36 overlapping polygons",
      "Donut chart displaying raw household counts"
    ],
    correctAnswer: 0,
    explanation: "Choropleth thematic maps leverage geographical cognition to show spatial distribution, regional disparities, and contiguous patterns without cluttered slices.",
    keyConcept: "Thematic Choropleth Mapping"
  },

  // APIs & System Integration
  {
    id: "q-api-beg-1",
    competencyId: "apis",
    difficulty: 1,
    scenario: "A government data portal exposes an endpoint to retrieve Consumer Price Index datasets for external ministries.",
    question: "Which HTTP method should be used according to RESTful architecture to retrieve statistical indicators without modifying server state?",
    options: [
      "GET",
      "POST",
      "DELETE",
      "PATCH"
    ],
    correctAnswer: 0,
    explanation: "HTTP GET is an idempotent, safe method designed strictly for retrieving representations of resources.",
    keyConcept: "RESTful HTTP Verbs & Idempotence"
  },
  {
    id: "q-api-int-1",
    competencyId: "apis",
    difficulty: 2,
    scenario: "An automated data dissemination service is overwhelmed by high-volume automated bot queries requesting large census tables.",
    question: "Which API management mechanism safeguards server availability while upholding fair access for line ministries?",
    options: [
      "Token Bucket / Leaky Bucket Rate Limiting with HTTP 429 Too Many Requests response headers",
      "Deleting the database table whenever traffic spikes",
      "Switching from JSON payloads to unformatted plain text",
      "Removing SSL/TLS encryption to reduce CPU usage"
    ],
    correctAnswer: 0,
    explanation: "Rate limiting algorithms regulate request rates per client/API key, returning HTTP 429 when thresholds are exceeded to maintain service stability.",
    keyConcept: "API Rate Limiting & Throttling Governance"
  },

  // Digital Public Infrastructure (DPI)
  {
    id: "q-dpi-beg-1",
    competencyId: "dpi",
    difficulty: 1,
    scenario: "MoSPI is integrating official statistical registries across government line ministries under the National Data Governance Framework Policy (NDGFP).",
    question: "What is the primary role of the India Datasets Platform (IDP) within Digital Public Infrastructure?",
    options: [
      "To provide unified, anonymized, and standardized access to non-personal datasets for research and governance.",
      "To replace all regional statistical offices with a private vendor.",
      "To store personal confidential medical files of citizens without consent.",
      "To sell raw voter lists to commercial advertisers."
    ],
    correctAnswer: 0,
    explanation: "The India Datasets Platform under NDGFP creates a secure, standardized ecosystem for sharing anonymized non-personal government data for public policy.",
    keyConcept: "National Data Governance Framework Policy"
  },

  // SDG Indicators
  {
    id: "q-sdg-beg-1",
    competencyId: "sdg_indicators",
    difficulty: 1,
    scenario: "An officer in the Social Statistics Division monitors India's progress on Sustainable Development Goal 1 (No Poverty).",
    question: "What is the official framework established by MoSPI to align global UN SDG targets with Indian official statistical data flows?",
    options: [
      "National Indicator Framework (NIF) with baseline years and periodic metadata updates",
      "General Agreement on Tariffs and Trade (GATT)",
      "International Accounting Standard 38",
      "Annual Financial Statement of the Union Government"
    ],
    correctAnswer: 0,
    explanation: "MoSPI developed the National Indicator Framework (NIF) consisting of national socio-economic indicators aligned with the 17 UN SDGs.",
    keyConcept: "National Indicator Framework (NIF) Architecture"
  },

  // GIS & Spatial Statistics
  {
    id: "q-gis-beg-1",
    competencyId: "gis",
    difficulty: 1,
    scenario: "During the pre-survey phase of a household sample survey, an officer inspects Primary Sampling Units (PSUs).",
    question: "What is 'Geofencing' in the context of mobile CAPI survey field operations?",
    options: [
      "Creating a virtual geographic boundary around sample enumeration blocks to ensure interviews occur inside the assigned sample polygon.",
      "Installing physical wooden fences around surveyed agricultural plots.",
      "Encrypting the survey database with geospatial passwords.",
      "Restricting enumerators from using smartphones during daylight hours."
    ],
    correctAnswer: 0,
    explanation: "Geofencing uses GPS coordinates on tablets to verify that enumerator interviews take place physically inside the selected sample boundary.",
    keyConcept: "CAPI Geofencing & Spatial Verification"
  },

  // Metadata Standards
  {
    id: "q-meta-beg-1",
    competencyId: "metadata_standards",
    difficulty: 1,
    scenario: "MoSPI publishes a National Microdata Archive (NADA) catalog containing PLFS survey rounds.",
    question: "Which international XML-based metadata standard is officially utilized to document survey methodology, variables, codebooks, and questionnaire schedules?",
    options: [
      "Data Documentation Initiative (DDI) & SDMX",
      "HTML5 Canvas Specification",
      "Portable Document Format (PDF/A)",
      "Simple Mail Transfer Protocol (SMTP)"
    ],
    correctAnswer: 0,
    explanation: "The Data Documentation Initiative (DDI) and SDMX are global open standards for expressing statistical microdata and aggregate time series metadata.",
    keyConcept: "DDI & SDMX Statistical Metadata Standards"
  },

  // Cybersecurity
  {
    id: "q-sec-beg-1",
    competencyId: "cybersecurity",
    difficulty: 1,
    scenario: "A statistical database contains sensitive microdata on manufacturing establishments collected under the Collection of Statistics Act.",
    question: "Under the Principle of Least Privilege (PoLP) and Role-Based Access Control (RBAC), who should be granted write access to production database tables?",
    options: [
      "Only authorized database administrators and certified pipeline services requiring write permissions for official batch loads.",
      "All employees and enumerators across the department without authentication.",
      "External visitors connecting via guest Wi-Fi networks.",
      "Any user who has logged in with an officer-tier account."
    ],
    correctAnswer: 0,
    explanation: "Least Privilege dictates that identities receive only the minimal permissions necessary to execute their verified functions.",
    keyConcept: "Role-Based Access Control & Principle of Least Privilege"
  }
];

// Merge without duplicates
const existingIds = new Set(existing.map(q => q.id));
let addedCount = 0;
newQuestions.forEach(q => {
  if (!existingIds.has(q.id)) {
    existing.push(q);
    existingIds.add(q.id);
    addedCount++;
  }
});

fs.writeFileSync(questionsPath, JSON.stringify(existing, null, 2), 'utf8');
console.log(`Successfully added ${addedCount} new scenario questions. Total questions now: ${existing.length}`);
