const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, '../server/data/questions.json');
const compsPath = path.join(__dirname, '../server/data/competencies.json');

const competencies = JSON.parse(fs.readFileSync(compsPath, 'utf8'));

// Existing questions
let existing = [];
try {
  existing = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
} catch (e) {
  existing = [];
}

// Defined rich questions covering key official statistical competencies (5 questions per competency)
const questionBank = {
  national_accounts: [
    {
      id: "q-na-1",
      competencyId: "national_accounts",
      difficulty: 1,
      scenario: "In quarterly macroeconomic reporting by the National Accounts Division (NAD), compiling agencies distinguish between Gross Domestic Product (GDP) and Gross Value Added (GVA).",
      question: "Which formula correctly reflects the relationship between GDP at market prices and GVA at basic prices under the SNA 2008 framework?",
      options: [
        "GDP = GVA at basic prices + Product Taxes - Product Subsidies",
        "GDP = GVA at factor cost + Export Duties - Import Tariffs",
        "GDP = Net Domestic Product + Consumption of Fixed Capital - Direct Taxes",
        "GDP = Gross National Income - Net Factor Income from Abroad + Corporate Tax"
      ],
      correctAnswer: 0,
      explanation: "Under the System of National Accounts (SNA 2008) adopted by MoSPI, GDP at market prices is derived as GVA at basic prices plus product taxes minus product subsidies.",
      keyConcept: "GDP and GVA Conversion Formula (SNA 2008)"
    },
    {
      id: "q-na-2",
      competencyId: "national_accounts",
      difficulty: 1,
      scenario: "During national accounting compilation, statisticians measure the economic contribution of unorganized household enterprises where labor and capital inputs cannot be separately disentangled.",
      question: "In the production accounts of unincorporated household enterprises, how is this combined income classified?",
      options: [
        "Mixed Income of the Self-Employed",
        "Operating Surplus of Financial Corporations",
        "Compensation of Formal Employees",
        "Consumption of Fixed Capital"
      ],
      correctAnswer: 0,
      explanation: "Mixed income represents the return to both labor and capital for unincorporated household enterprises where owner labor cannot be separated from profits.",
      keyConcept: "Mixed Income in Household Sector"
    },
    {
      id: "q-na-3",
      competencyId: "national_accounts",
      difficulty: 2,
      scenario: "Compiling constant price GDP requires removing the effect of price changes across various economic sectors.",
      question: "Which methodological technique is considered standard in national accounts to deflate both output and intermediate consumption with separate price indices?",
      options: [
        "Double Deflation Method",
        "Single Indicator Extrapolation",
        "Direct Nominal Scaling",
        "Hedonic Volume Imputation"
      ],
      correctAnswer: 0,
      explanation: "Double deflation deflates gross output with output price indices and intermediate inputs with input-specific indices, calculating real GVA as the residual.",
      keyConcept: "Double Deflation for Real GVA"
    },
    {
      id: "q-na-4",
      competencyId: "national_accounts",
      difficulty: 2,
      scenario: "National income accountants must estimate annual Consumption of Fixed Capital (CFC) for government and private infrastructure assets.",
      question: "Which standard empirical method does MoSPI employ to calculate CFC across asset types based on acquisition history and expected service life?",
      options: [
        "Perpetual Inventory Method (PIM)",
        "Book Value Straight-Line Depreciation from Tax Filings",
        "Uniform 10% Flat Rate Amortization",
        "Residual Liquidation Value Pricing"
      ],
      correctAnswer: 0,
      explanation: "The Perpetual Inventory Method (PIM) models historical capital asset acquisitions, price deflators, and asset survival functions to estimate current-cost capital consumption.",
      keyConcept: "Perpetual Inventory Method (PIM)"
    },
    {
      id: "q-na-5",
      competencyId: "national_accounts",
      difficulty: 3,
      scenario: "A revision of the GDP Base Year is being finalized, incorporating MCA-21 electronic financial filing data alongside ASI and economic census benchmarks.",
      question: "When replacing volume extrapolators with corporate financial microdata in the corporate manufacturing sector, which adjustment is mandatory to prevent double counting?",
      options: [
        "Deduction of non-operating enterprise holding gains and adjustment for auxiliary service units",
        "Doubling the recorded sales revenue across listed joint ventures",
        "Excluding all foreign direct investment enterprises from GVA",
        "Substituting nominal sales with physical metric tonnage"
      ],
      correctAnswer: 0,
      explanation: "MCA-21 enterprise reporting requires adjusting for enterprise versus establishment reporting, removing holding gains/losses, and accounting for headquarter services to prevent duplication.",
      keyConcept: "MCA-21 Enterprise Balancing in GVA Revisions"
    }
  ],

  price_statistics: [
    {
      id: "q-price-1",
      competencyId: "price_statistics",
      difficulty: 1,
      scenario: "The Price Statistics Division calculates the Consumer Price Index (CPI) using representative commodity baskets across urban and rural sectors.",
      question: "Which classical index number formula forms the mathematical foundation for India's Consumer Price Index compilation?",
      options: [
        "Laspeyres Base-Weighted Price Index",
        "Paasche Current-Weighted Price Index",
        "Fisher Ideal Geometric Mean Index",
        "Marshall-Edgeworth Unweighted Aggregate"
      ],
      correctAnswer: 0,
      explanation: "CPI in India uses a modified Laspeyres formula where fixed base-period expenditure weights derived from Consumer Expenditure Surveys are applied to current price relatives.",
      keyConcept: "Laspeyres Index in Official CPI"
    },
    {
      id: "q-price-2",
      competencyId: "price_statistics",
      difficulty: 1,
      scenario: "During monthly rural and urban retail price collection, a designated field shop is found permanently closed.",
      question: "According to standard price collection guidelines, what is the correct immediate procedure for the statistical investigator?",
      options: [
        "Select a pre-approved substitute outlet in the same locality offering comparable quality goods.",
        "Record the previous month's price indefinitely without reporting closure.",
        "Delete the commodity item from the state index calculation.",
        "Enter zero for all uncollected item specifications."
      ],
      correctAnswer: 0,
      explanation: "When an outlet permanently closes, standard operating procedure mandates selecting a pre-approved comparable replacement outlet in the same market center.",
      keyConcept: "Outlet Substitution Guidelines"
    },
    {
      id: "q-price-3",
      competencyId: "price_statistics",
      difficulty: 2,
      scenario: "In compiling elementary aggregate price indices before applying expenditure weights, field offices aggregate price quotations for homogenous items.",
      question: "Which elementary aggregate index formula takes the geometric mean of price relatives and satisfies both the time-reversal and transitivity axioms?",
      options: [
        "Jevons Index",
        "Dutot Arithmetic Mean of Prices",
        "Carli Unweighted Average of Relatives",
        "Harmonic Mean Index"
      ],
      correctAnswer: 0,
      explanation: "The Jevons index computes the geometric mean of price relatives, avoiding the upward substitution bias inherent in the Carli formula.",
      keyConcept: "Jevons Elementary Aggregate Formula"
    },
    {
      id: "q-price-4",
      competencyId: "price_statistics",
      difficulty: 2,
      scenario: "A branded smartphone in the CPI electronics basket undergoes a technological upgrade featuring doubled memory and improved sensors at a 5% higher price.",
      question: "To isolate genuine inflationary price change from quality improvement, which index adjustment method should be applied?",
      options: [
        "Hedonic Quality Adjustment or Overlap Pricing",
        "Treating the entire 5% increase as pure inflation",
        "Dropping all electronic items from the index",
        "Imputing a 0% price change regardless of specifications"
      ],
      correctAnswer: 0,
      explanation: "Hedonic adjustments or matched model overlap pricing decompose observed price changes into quality improvements versus genuine price inflation.",
      keyConcept: "Quality Adjustment in Price Indices"
    },
    {
      id: "q-price-5",
      competencyId: "price_statistics",
      difficulty: 3,
      scenario: "In seasonal fruit and vegetable items (such as mangoes or winter greens), commodities disappear entirely from markets for several months.",
      question: "What is the recommended international approach used by MoSPI to handle temporary seasonal non-availability in monthly CPI compilation?",
      options: [
        "Imputation using the price movement of available items in the same sub-group (Carry-Forward or Class Mean Imputation)",
        "Assigning a price of zero to non-available items",
        "Excluding food products entirely during off-season months",
        "Arbitrarily doubling the weights of non-perishable food grains"
      ],
      correctAnswer: 0,
      explanation: "Class mean imputation or imputed relative price movements based on active sub-group items maintains index continuity during off-season months without distorting expenditure weights.",
      keyConcept: "Seasonal Item Imputation in CPI"
    }
  ],

  statistical_analysis: [
    {
      id: "q-stat-1",
      competencyId: "statistical_analysis",
      difficulty: 1,
      scenario: "An officer analyzing monthly industrial production indicators calculates measures of central tendency and dispersion for regional manufacturing units.",
      question: "If a survey variable exhibits significant positive skewness (long right tail), which measure of central tendency provides the most robust reflection of typical performance?",
      options: [
        "Median",
        "Arithmetic Mean",
        "Mid-Range",
        "Harmonic Mean"
      ],
      correctAnswer: 0,
      explanation: "The median is robust against extreme outliers and skewness, whereas the arithmetic mean is pulled towards extreme values in the tail.",
      keyConcept: "Robust Measures of Central Tendency"
    },
    {
      id: "q-stat-2",
      competencyId: "statistical_analysis",
      difficulty: 1,
      scenario: "A policy department wants to test whether average household expenditure on education has changed significantly between two consecutive survey rounds.",
      question: "In formal hypothesis testing, what does the p-value represent?",
      options: [
        "The probability of observing a test statistic as extreme as the calculated value under the assumption that the null hypothesis is true.",
        "The probability that the alternative hypothesis is false.",
        "The absolute margin of measurement error in the field survey.",
        "The percentage of missing questionnaires in the sample."
      ],
      correctAnswer: 0,
      explanation: "A p-value is the probability of obtaining test results at least as extreme as observed data, assuming that the null hypothesis is true.",
      keyConcept: "P-Value and Hypothesis Testing"
    },
    {
      id: "q-stat-3",
      competencyId: "statistical_analysis",
      difficulty: 2,
      scenario: "In an econometric evaluation of state-level employment determinants, an officer estimates a multiple linear regression model.",
      question: "If two independent variables have a correlation of 0.92, which statistical condition is present, and what is its primary econometric effect?",
      options: [
        "Multicollinearity; it inflates the standard errors of regression coefficients without biasing point estimates.",
        "Heteroscedasticity; it biases the OLS point estimates.",
        "Autocorrelation; it invalidates the R-squared statistic.",
        "Endogeneity; it guarantees omitted variable bias."
      ],
      correctAnswer: 0,
      explanation: "High correlation among explanatory variables causes multicollinearity, inflating coefficient variances and making individual t-tests insignificant despite high overall model fit.",
      keyConcept: "Multicollinearity and Variance Inflation"
    },
    {
      id: "q-stat-4",
      competencyId: "statistical_analysis",
      difficulty: 2,
      scenario: "When analyzing cross-sectional household survey microdata, the error variance of consumption expenditure increases systematically with household income.",
      question: "Which statistical remedy is recommended to obtain efficient estimates when heteroscedasticity is detected in survey regressions?",
      options: [
        "Heteroscedasticity-Consistent (White-Huber) Standard Errors or Weighted Least Squares (WLS)",
        "Discarding all high-income household observations",
        "Converting continuous variables into unranked ordinal categories",
        "Setting the intercept term to zero"
      ],
      correctAnswer: 0,
      explanation: "Robust White-Huber standard errors or Weighted Least Squares (WLS) restore valid statistical inference when residual variance is not constant.",
      keyConcept: "Heteroscedasticity and Robust Standard Errors"
    },
    {
      id: "q-stat-5",
      competencyId: "statistical_analysis",
      difficulty: 3,
      scenario: "A macroeconomic researcher analyzes time series data for quarterly IIP and electricity generation to determine if they share a long-run equilibrium relationship.",
      question: "Which statistical sequence should be executed prior to estimating a vector error correction model (VECM)?",
      options: [
        "Augmented Dickey-Fuller (ADF) stationarity tests followed by Johansen Cointegration testing",
        "Standard Ordinary Least Squares with lagged endogenous variables",
        "Independent sample t-tests on raw non-stationary levels",
        "Simple moving average smoothing without unit root testing"
      ],
      correctAnswer: 0,
      explanation: "Establishing integrated order I(1) via unit root tests (e.g. ADF) followed by Johansen cointegration is required before estimating a VECM to avoid spurious regression.",
      keyConcept: "Cointegration and Unit Root Testing"
    }
  ],

  data_visualization: [
    {
      id: "q-viz-1",
      competencyId: "data_visualization",
      difficulty: 1,
      scenario: "An officer is preparing charts for the Annual Statistical Abstract to display the distribution of employment across 5 major sectors.",
      question: "According to cognitive visualization principles, which chart type is preferred over 3D pie charts for accurately comparing categorical proportions?",
      options: [
        "Horizontal Bar Chart with sorted values",
        "Exploded 3D Donut Chart with shadow effects",
        "Radar Plot with intersecting polygon lines",
        "Multi-layer Treemap without text labels"
      ],
      correctAnswer: 0,
      explanation: "Human vision decodes lengths on a common baseline (bar charts) with significantly higher accuracy than angles and areas in 3D pie/donut charts.",
      keyConcept: "Cognitive Accuracy in Categorical Charts"
    },
    {
      id: "q-viz-2",
      competencyId: "data_visualization",
      difficulty: 1,
      scenario: "A public dashboard displays state-wise Infant Mortality Rates across 28 states and 8 union territories.",
      question: "What visualization best highlights spatial clustering and geographic variation across administrative boundaries?",
      options: [
        "Choropleth Map using a standardized sequential color palette",
        "Unordered vertical column chart with 36 columns",
        "Scatter plot of state serial numbers against rates",
        "Circular gauge with 36 dials"
      ],
      correctAnswer: 0,
      explanation: "Choropleth thematic maps represent geographic data visually through shaded polygon boundaries, immediately revealing spatial regional patterns.",
      keyConcept: "Choropleth Thematic Maps"
    },
    {
      id: "q-viz-3",
      competencyId: "data_visualization",
      difficulty: 2,
      scenario: "A dashboard team is designing an interactive tool to explore multi-dimensional household microdata across income deciles, urban/rural sectors, and family sizes.",
      question: "Which interactive dashboard capability allows an executive to click on a state in a map and automatically filter all corresponding charts in real time?",
      options: [
        "Cross-filtering (Linked Brushing)",
        "Static page refresh with full database re-indexing",
        "Hardcoded PDF bookmark links",
        "Screen resolution auto-stretching"
      ],
      correctAnswer: 0,
      explanation: "Linked cross-filtering (coordinated multiple views) propagates filter dimensions across charts instantaneously when an analyst interacts with a visual element.",
      keyConcept: "Interactive Cross-Filtering and Linked Views"
    },
    {
      id: "q-viz-4",
      competencyId: "data_visualization",
      difficulty: 2,
      scenario: "To ensure statistical charts in official publications are accessible to all citizens, including individuals with color vision deficiencies (CVD).",
      question: "Which color design guideline should be strictly adopted for official analytical graphics?",
      options: [
        "Use perceptually uniform, colorblind-safe palettes (e.g. Viridis, ColorBrewer) and redundant encoding (labels/patterns)",
        "Rely exclusively on red and green traffic-light contrasts without text labels",
        "Render all text in low-contrast light grey against white backgrounds",
        "Use rainbow color maps with maximum saturation"
      ],
      correctAnswer: 0,
      explanation: "Perceptually uniform colorblind-safe palettes combined with dual-encoding (labels, line styles) guarantee accessibility compliance under WCAG guidelines.",
      keyConcept: "Accessible Color Design (WCAG/CVD)"
    },
    {
      id: "q-viz-5",
      competencyId: "data_visualization",
      difficulty: 3,
      scenario: "An executive KPI dashboard displays live daily CPI quotation collection progress from 1,181 market centers across India.",
      question: "To prevent dashboard latency and memory exhaustion when rendering large temporal microdata series, which frontend optimization pattern is most effective?",
      options: [
        "Server-side spatial/temporal aggregation with Level-of-Detail (LOD) downsampling",
        "Transferring 500 MB of uncompressed JSON records directly to browser DOM memory",
        "Rendering each data point as an unbatched SVG path element",
        "Polling the raw database table every 200 milliseconds"
      ],
      correctAnswer: 0,
      explanation: "Level-of-Detail (LOD) downsampling and server-side aggregation summarize micro-records into displayable pixel resolutions, keeping dashboard rendering smooth.",
      keyConcept: "Large-Scale Microdata Dashboard Optimization"
    }
  ],

  data_quality_frameworks: [
    {
      id: "q-dqf-1",
      competencyId: "data_quality_frameworks",
      difficulty: 1,
      scenario: "MoSPI aligns its official statistics with the United Nations Fundamental Principles of Official Statistics and the National Quality Assurance Framework (NQAF).",
      question: "What are the six core dimensions of statistical data quality defined in modern quality assurance frameworks?",
      options: [
        "Relevance, Accuracy, Timeliness, Accessibility, Interpretability, and Coherence",
        "Speed, Volume, Cost, Popularity, Exclusivity, and Complexity",
        "Format, Encryption, Redundancy, Bandwidth, File Size, and Storage",
        "Publicity, Political Impact, Brevity, Density, Tone, and Design"
      ],
      correctAnswer: 0,
      explanation: "NQAF defines data quality across Relevance, Accuracy and Reliability, Timeliness and Punctuality, Accessibility and Clarity, Coherence and Comparability.",
      keyConcept: "NQAF Core Data Quality Dimensions"
    },
    {
      id: "q-dqf-2",
      competencyId: "data_quality_frameworks",
      difficulty: 1,
      scenario: "In large-scale socio-economic surveys, non-sampling errors frequently arise during the enumeration phase.",
      question: "Which of the following is categorized as a non-sampling error rather than a sampling error?",
      options: [
        "Enumerator recording error or respondent recall bias",
        "Random variation due to observing a subset instead of the entire population",
        "Standard error of a two-stage cluster mean",
        "Margin of error derived from sample size allocation"
      ],
      correctAnswer: 0,
      explanation: "Non-sampling errors stem from questionnaire design, measurement, respondent recall, non-response, and data entry, existing in both sample surveys and complete censuses.",
      keyConcept: "Sampling vs Non-Sampling Errors"
    },
    {
      id: "q-dqf-3",
      competencyId: "data_quality_frameworks",
      difficulty: 2,
      scenario: "A divisional audit team conducts an automated validation run on newly received CAPI field survey schedules.",
      question: "Which validation check ensures that an individual who is reported as a 5-year-old child cannot have a recorded marital status of 'Widowed'?",
      options: [
        "Inter-field Consistency Check (Cross-Validation Rule)",
        "Range Check on a single isolated variable",
        "Format Syntax Validation",
        "Referential Integrity Primary Key Constraint"
      ],
      correctAnswer: 0,
      explanation: "Inter-field consistency rules test logical interdependencies between multiple survey variables (e.g. age vs marital status or educational attainment).",
      keyConcept: "Inter-Field Consistency Rules"
    },
    {
      id: "q-dqf-4",
      competencyId: "data_quality_frameworks",
      difficulty: 2,
      scenario: "When publishing official statistical series, agencies document methodological breaks or structural revisions to maintain time-series coherence.",
      question: "What formal document is required under NQAF standards to accompany statistical releases, explaining data sources, definitions, classifications, and limitations?",
      options: [
        "Standard Metadata Quality Report",
        "Internal Audit Memorandum",
        "Executive Press Release Only",
        "Software Source Code Repository"
      ],
      correctAnswer: 0,
      explanation: "Quality metadata reports provide comprehensive documentation on concepts, methodologies, sampling frameworks, and accuracy indicators necessary for user interpretation.",
      keyConcept: "Quality Metadata Reports"
    },
    {
      id: "q-dqf-5",
      competencyId: "data_quality_frameworks",
      difficulty: 3,
      scenario: "In an enterprise survey, item non-response on annual fuel expenditure affects 8% of reporting factories.",
      question: "Under institutional statistical quality protocols, what is the best practice for handling missing data without introducing systematic distortion?",
      options: [
        "Implement validated statistical imputation (e.g., hot-deck or model-based) and flag all imputed cells in the microdata.",
        "Delete all 8% of enterprise records from the entire survey database.",
        "Replace missing values with zero without documentation.",
        "Arbitrarily input the national mean without flagging."
      ],
      correctAnswer: 0,
      explanation: "Proper quality assurance mandates transparent statistical imputation methods paired with imputation flags so secondary researchers can distinguish observed from estimated data.",
      keyConcept: "Imputation Flagging and Audit Transparency"
    }
  ],

  survey_design: [
    {
      id: "q-surv-1",
      competencyId: "survey_design",
      difficulty: 1,
      scenario: "In preparing a nationwide household survey on health expenditures, the Survey Design and Research Division (SDRD) specifies the survey scope.",
      question: "What is the primary purpose of defining the 'Target Population' versus the 'Sampling Frame' in survey methodology?",
      options: [
        "The target population is the complete group about which information is desired; the frame is the operational list or map from which sample units are selected.",
        "The target population is always identical to the sampling frame in every survey.",
        "The sampling frame refers only to completed questionnaires after fieldwork.",
        "The target population is determined by the software used to tabulate results."
      ],
      correctAnswer: 0,
      explanation: "The target population defines theoretical eligibility, while the sampling frame is the practical operational registry (e.g., census enumeration blocks) used for selection.",
      keyConcept: "Target Population vs Sampling Frame"
    },
    {
      id: "q-surv-2",
      competencyId: "survey_design",
      difficulty: 1,
      scenario: "Designing a questionnaire schedule for rural households requires avoiding response bias.",
      question: "Which of the following represents a leading question that should be eliminated from survey instruments?",
      options: [
        "\"Do you agree that the new rural irrigation scheme has greatly benefited your family?\"",
        "\"Did your household use irrigation for crops during the last agricultural year?\"",
        "\"What type of irrigation source was primarily used?\"",
        "\"Approximately how many hectares were irrigated?\""
      ],
      correctAnswer: 0,
      explanation: "Leading questions suggest a socially desirable or expected response, violating neutral questionnaire design principles.",
      keyConcept: "Elimination of Leading Questions"
    },
    {
      id: "q-surv-3",
      competencyId: "survey_design",
      difficulty: 2,
      scenario: "Prior to launching a full-scale national survey round, SDRD schedules a pilot survey across selected test districts.",
      question: "What is the primary scientific objective of conducting a pre-test or pilot survey?",
      options: [
        "To evaluate questionnaire schedule flow, question comprehension, interview duration, and CAPI validation rules under real field conditions.",
        "To publish preliminary national policy estimates in advance.",
        "To eliminate the need for training field enumerators.",
        "To test whether respondents will accept financial payments for answers."
      ],
      correctAnswer: 0,
      explanation: "Pilot surveys test instrument feasibility, question clarity, Skip logic, translation nuances, and field logistics before deploying at national scale.",
      keyConcept: "Pilot Surveys and Instrument Pre-Testing"
    },
    {
      id: "q-surv-4",
      competencyId: "survey_design",
      difficulty: 2,
      scenario: "Field investigators transition from paper schedules to Computer Assisted Personal Interviewing (CAPI) on mobile tablets.",
      question: "Which quality safeguard is uniquely enabled by CAPI technology during data collection?",
      options: [
        "Real-time range validations, automated skip patterns, and GPS timestamp logging at point of interview.",
        "Elimination of the requirement for informed consent.",
        "Automatic generation of fake responses when households are absent.",
        "Immediate public posting of unverified responses to social media."
      ],
      correctAnswer: 0,
      explanation: "CAPI systems prevent routing errors, enforce inter-field logic at point of interview, and log temporal/spatial metadata to ensure interview authenticity.",
      keyConcept: "CAPI Quality Safeguards and Real-Time Validation"
    },
    {
      id: "q-surv-5",
      competencyId: "survey_design",
      difficulty: 3,
      scenario: "An agricultural survey schedule aims to estimate seasonal crop yields and farmer debt across tenant farmers and landowners.",
      question: "When measuring sensitive financial topics like informal loans, which questionnaire structuring technique minimizes social desirability bias and non-response?",
      options: [
        "Placing sensitive debt questions in the middle/later section of the schedule after establishing rapport, using neutral standardized brackets.",
        "Placing sensitive debt questions on the very first line of the questionnaire.",
        "Asking neighbors to report on each other's debt obligations.",
        "Threatening legal penalties under the Statistics Act for refusal to answer."
      ],
      correctAnswer: 0,
      explanation: "Placing sensitive inquiries after establishing rapport and using non-judgmental category ranges minimizes respondent resistance and non-response bias.",
      keyConcept: "Sensitive Question Placement & Non-Response Mitigation"
    }
  ],

  sampling: [
    {
      id: "q-samp-1",
      competencyId: "sampling",
      difficulty: 1,
      scenario: "National Sample Survey Office (NSSO) surveys commonly utilize a multi-stage stratified sampling design across rural and urban sectors.",
      question: "In standard NSSO two-stage designs, what typically constitutes the First Stage Unit (FSU) and Second Stage Unit (SSU)?",
      options: [
        "FSU: Census Village (rural) or Urban Frame Survey (UFS) block; SSU: Households",
        "FSU: Individual persons; SSU: Entire districts",
        "FSU: Private businesses; SSU: State government ministries",
        "FSU: Country; SSU: Municipal wards"
      ],
      correctAnswer: 0,
      explanation: "In official multi-stage household surveys, primary clusters (Census villages or UFS blocks) are selected as FSUs, and listed households within selected FSUs serve as SSUs.",
      keyConcept: "Multi-Stage Sampling Framework (FSU/SSU)"
    },
    {
      id: "q-samp-2",
      competencyId: "sampling",
      difficulty: 1,
      scenario: "An investigator selects a sample of 200 manufacturing factories from an industrial directory where large establishments account for 80% of total output.",
      question: "Which probability sampling method ensures that rare or highly variable sub-populations (e.g. large mega-factories) are adequately represented?",
      options: [
        "Stratified Random Sampling with disproportionate allocation",
        "Simple Random Sampling without replacement",
        "Voluntary Response Sampling",
        "Convenience Sampling along national highways"
      ],
      correctAnswer: 0,
      explanation: "Stratifying by enterprise size and oversampling large units reduces estimator variance and guarantees adequate sample size in skewed distributions.",
      keyConcept: "Stratified Sampling in Skewed Populations"
    },
    {
      id: "q-samp-3",
      competencyId: "sampling",
      difficulty: 2,
      scenario: "In selecting villages (FSUs) within a district stratum, some villages have 5,000 residents while others have only 200.",
      question: "Which sampling technique allocates higher selection probabilities to larger units to improve estimation efficiency for population totals?",
      options: [
        "Probability Proportional to Size (PPS) Sampling",
        "Equal Probability Simple Random Sampling",
        "Haphazard Quota Selection",
        "Snowball Referral Sampling"
      ],
      correctAnswer: 0,
      explanation: "PPS sampling assigns selection probabilities proportional to a measure of size (e.g. population), producing self-weighting samples when combined with equal SSU selection.",
      keyConcept: "Probability Proportional to Size (PPS)"
    },
    {
      id: "q-samp-4",
      competencyId: "sampling",
      difficulty: 2,
      scenario: "A survey data analyst calculates population estimates from a sample of 12,000 households selected with unequal probabilities.",
      question: "What formula or multiplier must be applied to each sample observation y_i with selection probability pi_i to calculate an unbiased population total estimate?",
      options: [
        "Horvitz-Thompson Estimator: sum(y_i / pi_i)",
        "Simple Sample Mean multiplied by sample size: n * y_bar",
        "Unweighted summation of raw observations: sum(y_i)",
        "Maximum Likelihood Exponential Smoothing"
      ],
      correctAnswer: 0,
      explanation: "The Horvitz-Thompson estimator weights each observation by the inverse of its inclusion probability (w_i = 1/pi_i) to yield an unbiased estimate of the total.",
      keyConcept: "Horvitz-Thompson Estimator and Design Weights"
    },
    {
      id: "q-samp-5",
      competencyId: "sampling",
      difficulty: 3,
      scenario: "Due to clustering in multi-stage survey designs, observations within the same primary sampling unit (village) tend to be more similar than observations across different villages.",
      question: "Which statistical metric quantifies this clustering effect, indicating how much larger sample variance is compared to simple random sampling?",
      options: [
        "Design Effect (DEFF) and Intraclass Correlation Coefficient (ICC)",
        "Pearson Correlation Coefficient",
        "Gini Concentration Ratio",
        "Cronbach's Alpha Reliability Metric"
      ],
      correctAnswer: 0,
      explanation: "The Design Effect (DEFF = 1 + (m-1)*ICC) measures the ratio of the variance under the complex design to the variance under simple random sampling.",
      keyConcept: "Design Effect (DEFF) and Clustering Impact"
    }
  ],

  labour_statistics: [
    {
      id: "q-lab-1",
      competencyId: "labour_statistics",
      difficulty: 1,
      scenario: "In the Periodic Labour Force Survey (PLFS), economic activity status is determined using specific standardized reference periods.",
      question: "What reference period is evaluated to classify an individual's 'Usual Status' (ps+ss) versus 'Current Weekly Status' (CWS)?",
      options: [
        "Usual Status: Preceding 365 days; Current Weekly Status: Preceding 7 days",
        "Usual Status: Past 30 days; Current Weekly Status: Past 24 hours",
        "Usual Status: Lifetime work history; Current Weekly Status: Past calendar month",
        "Usual Status: Calendar year 2020; Current Weekly Status: Previous fortnight"
      ],
      correctAnswer: 0,
      explanation: "Usual status refers to activity during the preceding 365 days (principal status + subsidiary status), while Current Weekly Status uses the preceding 7 days.",
      keyConcept: "Usual Status vs Current Weekly Status Reference Periods"
    },
    {
      id: "q-lab-2",
      competencyId: "labour_statistics",
      difficulty: 1,
      scenario: "An officer compiles primary labour indicators from quarterly urban PLFS survey rounds.",
      question: "How is the Labour Force Participation Rate (LFPR) officially defined in Indian labour statistics?",
      options: [
        "Percentage of persons in the labour force (working or seeking/available for work) in the total population.",
        "Percentage of employed persons relative to unemployed persons.",
        "Total number of citizens paying income tax divided by working-age adults.",
        "Number of registered job-seekers in government employment exchanges."
      ],
      correctAnswer: 0,
      explanation: "LFPR is the percentage of the population engaged in economic activities or seeking/available for work.",
      keyConcept: "Labour Force Participation Rate (LFPR) Definition"
    },
    {
      id: "q-lab-3",
      competencyId: "labour_statistics",
      difficulty: 2,
      scenario: "An individual worked for 2 hours on a single day during the reference week and was looking for work the rest of the week.",
      question: "Under the Current Weekly Status (CWS) 1-hour criterion established by the ILO and MoSPI, how is this person classified for the reference week?",
      options: [
        "Employed (in workforce) for the reference week",
        "Unemployed for the entire week",
        "Out of Labour Force (marginalized)",
        "Informal seasonal migrant"
      ],
      correctAnswer: 0,
      explanation: "Under the international 1-hour priority rule in CWS, having worked for at least 1 hour during the reference 7 days classifies an individual as employed.",
      keyConcept: "Current Weekly Status 1-Hour Criterion"
    },
    {
      id: "q-lab-4",
      competencyId: "labour_statistics",
      difficulty: 2,
      scenario: "When analyzing enterprise types in the informal sector, PLFS distinguishes informal employment from formal employment.",
      question: "According to official MoSPI PLFS definitions, what key institutional characteristic defines an employee with 'formal' employment?",
      options: [
        "Entitlement to social security benefits (pension, provident fund, health insurance, paid leave)",
        "Working in an office with air conditioning",
        "Receiving compensation through electronic bank transfer",
        "Having completed tertiary university education"
      ],
      correctAnswer: 0,
      explanation: "Formal employment is primarily distinguished by access to employer-provided social security benefits like provident funds, health care, and paid leave.",
      keyConcept: "Social Security Criteria for Formal Employment"
    },
    {
      id: "q-lab-5",
      competencyId: "labour_statistics",
      difficulty: 3,
      scenario: "To estimate sampling errors for quarterly urban PLFS unemployment rates derived from rotational panel designs.",
      question: "Which resampling technique is officially employed to calculate standard errors in complex stratified multi-stage panel surveys?",
      options: [
        "Jackknife Repeated Replication or Balanced Repeated Replication (BRR)",
        "Standard deviation formula assuming independent identically distributed data",
        "Markov Chain Monte Carlo without survey weights",
        "Binomial normal approximation ignoring strata"
      ],
      correctAnswer: 0,
      explanation: "Complex survey error estimation uses replication methods (Jackknife/BRR) or Taylor series linearization to account for stratification, clustering, and panel rotation.",
      keyConcept: "Resampling and Variance Estimation in PLFS Panels"
    }
  ],

  sql: [
    {
      id: "q-sql-1",
      competencyId: "sql",
      difficulty: 1,
      scenario: "A data analyst queries a relational database containing NSSO survey schedules with tables households and persons.",
      question: "Which SQL clause filters rows based on an aggregate condition after grouping has been performed?",
      options: [
        "HAVING",
        "WHERE",
        "ORDER BY",
        "DISTINCT"
      ],
      correctAnswer: 0,
      explanation: "The WHERE clause filters rows prior to aggregation, whereas the HAVING clause filters groups based on aggregate results (e.g. HAVING count(*) > 5).",
      keyConcept: "HAVING vs WHERE in Relational Queries"
    },
    {
      id: "q-sql-2",
      competencyId: "sql",
      difficulty: 1,
      scenario: "In an enterprise database, an officer wants to list all manufacturing enterprises in the directory, including those that reported zero revenue.",
      question: "Which SQL JOIN type retains all rows from the primary enterprise registry table even when no matching transactions exist in the revenue table?",
      options: [
        "LEFT OUTER JOIN",
        "INNER JOIN",
        "CROSS JOIN",
        "NATURAL JOIN"
      ],
      correctAnswer: 0,
      explanation: "A LEFT OUTER JOIN returns all records from the left table and matched records from the right table, populating NULLs where matches do not exist.",
      keyConcept: "LEFT OUTER JOIN in Official Registries"
    },
    {
      id: "q-sql-3",
      competencyId: "sql",
      difficulty: 2,
      scenario: "A database query on 10 million person-level survey records must rank individuals by monthly per-capita expenditure within each state without collapsing the rows.",
      question: "Which SQL window function should be utilized to calculate within-state percentile ranks?",
      options: [
        "PERCENT_RANK() OVER (PARTITION BY state_id ORDER BY mpc_expenditure)",
        "GROUP BY state_id HAVING AVG(mpc_expenditure)",
        "COUNT(DISTINCT state_id) OVER (ORDER BY mpc_expenditure)",
        "ORDER BY state_id, mpc_expenditure DESC LIMIT 10"
      ],
      correctAnswer: 0,
      explanation: "Window functions with PARTITION BY compute analytical metrics over subsets of data while preserving individual row granularity.",
      keyConcept: "Window Functions and Analytical Partitioning"
    },
    {
      id: "q-sql-4",
      competencyId: "sql",
      difficulty: 2,
      scenario: "A query that joins large survey tables executes very slowly with sequential table scans across millions of records.",
      question: "Which database indexing structure is most effective for speeding up exact-match equality searches on survey identification keys (fsu_id, household_id)?",
      options: [
        "B-Tree Composite Index on (fsu_id, household_id)",
        "Full-Text Inverted Index on text descriptions",
        "Dropping the primary key constraint",
        "Converting the table to an unindexed CSV file"
      ],
      correctAnswer: 0,
      explanation: "A B-Tree composite index on high-cardinality join keys enables logarithmic lookup time (O(log N)), replacing expensive sequential table scans.",
      keyConcept: "B-Tree Indexing and Query Performance"
    },
    {
      id: "q-sql-5",
      competencyId: "sql",
      difficulty: 3,
      scenario: "A statistical database transaction updates multi-table survey accounts across regional centers during overnight consolidation.",
      question: "Which database property in ACID transactions ensures that if a server crash occurs midway through a 5-table write batch, no partial or corrupted data is saved?",
      options: [
        "Atomicity (All-or-Nothing execution)",
        "Asynchronous Replication",
        "Auto-Increment Sequence Allocation",
        "Foreign Key Cascading Delete"
      ],
      correctAnswer: 0,
      explanation: "Atomicity guarantees that all statements within a transaction boundary complete successfully; otherwise, the database is rolled back to its pre-transaction state.",
      keyConcept: "ACID Transactional Integrity (Atomicity)"
    }
  ],

  python: [
    {
      id: "q-py-1",
      competencyId: "python",
      difficulty: 1,
      scenario: "An officer uses Python and the pandas library to load and inspect a microdata file from the Annual Survey of Industries.",
      question: "Which pandas method displays basic descriptive summary statistics (count, mean, std, min, quartiles, max) for all numeric columns?",
      options: [
        "df.describe()",
        "df.info()",
        "df.head()",
        "df.columns.summary()"
      ],
      correctAnswer: 0,
      explanation: "df.describe() generates descriptive summary statistics summarizing the central tendency, dispersion, and shape of a dataset's distribution.",
      keyConcept: "Pandas Exploratory Data Analysis"
    },
    {
      id: "q-py-2",
      competencyId: "python",
      difficulty: 1,
      scenario: "When handling survey microdata in Python, missing values are frequently encoded as NaN (Not a Number).",
      question: "Which pandas function correctly checks for missing values across a DataFrame?",
      options: [
        "df.isna().sum()",
        "df.drop_duplicates()",
        "df.replace(0, -1)",
        "df.empty()"
      ],
      correctAnswer: 0,
      explanation: "df.isna().sum() returns the count of missing (NaN) values per column in a pandas DataFrame.",
      keyConcept: "Missing Data Identification in Pandas"
    },
    {
      id: "q-py-3",
      competencyId: "python",
      difficulty: 2,
      scenario: "A data pipeline needs to calculate weighted average household consumption by multiplying expenditure with survey sampling weights.",
      question: "Using NumPy and pandas, how is a weighted average correctly calculated for a group?",
      options: [
        "np.average(df['expenditure'], weights=df['multiplier'])",
        "df['expenditure'].mean() * df['multiplier'].sum()",
        "df['expenditure'].sum() / len(df)",
        "df.groupby('multiplier')['expenditure'].max()"
      ],
      correctAnswer: 0,
      explanation: "np.average(values, weights=weights) computes the correct mathematically weighted average sum(w_i * x_i) / sum(w_i).",
      keyConcept: "Weighted Aggregation in NumPy"
    },
    {
      id: "q-py-4",
      competencyId: "python",
      difficulty: 2,
      scenario: "An automation script processes 5,000 Excel files containing district price returns and concatenates them into a single analytical table.",
      question: "Which list comprehension and pandas function pattern is most memory-efficient for combining multiple files?",
      options: [
        "pd.concat([pd.read_excel(f) for f in file_list], ignore_index=True)",
        "Calling df.append() in a sequential for-loop 5,000 times",
        "Opening files in binary mode and adding byte lengths together",
        "Writing a nested while loop that modifies the global dataframe"
      ],
      correctAnswer: 0,
      explanation: "Building a list of DataFrames and calling pd.concat() once is significantly faster and avoids the O(N^2) memory reallocation overhead of repeated appends.",
      keyConcept: "Batch File Processing and DataFrame Concatenation"
    },
    {
      id: "q-py-5",
      competencyId: "python",
      difficulty: 3,
      scenario: "A data science model processes 50 million individual census records using parallel processing across multiple CPU cores.",
      question: "Which Python standard library module bypasses the Global Interpreter Lock (GIL) to achieve true parallel CPU execution on multi-core servers?",
      options: [
        "multiprocessing or concurrent.futures.ProcessPoolExecutor",
        "threading module with time.sleep",
        "asyncio coroutines with event loop",
        "math library built-in functions"
      ],
      correctAnswer: 0,
      explanation: "The multiprocessing module spawns independent operating system processes with separate memory spaces, bypassing Python's GIL for CPU-bound computations.",
      keyConcept: "Multi-Core Parallel Computing in Python"
    }
  ],

  ai_ml: [
    {
      id: "q-aiml-1",
      competencyId: "ai_ml",
      difficulty: 1,
      scenario: "A statistical cell uses machine learning to predict economic distress indices across districts based on satellite imagery and survey indicators.",
      question: "In predictive modeling, what is the fundamental difference between supervised learning and unsupervised learning?",
      options: [
        "Supervised learning trains on labeled outcome data (y); unsupervised learning discovers latent structure without pre-labeled targets.",
        "Supervised learning does not use algorithms; unsupervised learning requires supercomputers.",
        "Supervised learning is only used for text; unsupervised learning is only for numbers.",
        "Supervised learning never suffers from overfitting."
      ],
      correctAnswer: 0,
      explanation: "Supervised learning maps input features to known target outputs (X -> y), while unsupervised learning finds clusters, patterns, or anomalies without ground truth targets.",
      keyConcept: "Supervised vs Unsupervised Learning"
    },
    {
      id: "q-aiml-2",
      competencyId: "ai_ml",
      difficulty: 1,
      scenario: "An officer evaluates a model developed to detect duplicate business registrations in the GST-ASI matching database.",
      question: "When evaluating an imbalanced classification problem where false negatives are critical, which metric is more informative than raw accuracy?",
      options: [
        "Precision, Recall, and F1-Score",
        "Raw percentage of correct classifications",
        "Mean Squared Error (MSE)",
        "Adjusted R-squared"
      ],
      correctAnswer: 0,
      explanation: "In imbalanced datasets, high accuracy can be misleading. Recall measures the proportion of actual positives successfully identified.",
      keyConcept: "Classification Metrics for Imbalanced Data"
    },
    {
      id: "q-aiml-3",
      competencyId: "ai_ml",
      difficulty: 2,
      scenario: "A machine learning pipeline trains a gradient boosted decision tree (XGBoost) to predict crop yields.",
      question: "To ensure that model hyperparameters are optimized without causing data leakage from test observations, which validation framework is standard?",
      options: [
        "K-Fold Cross-Validation on the training set with a completely held-out test set",
        "Evaluating performance directly on the training data used for fitting",
        "Training on 100% of the data and reporting training accuracy",
        "Selecting hyperparameters that maximize variance"
      ],
      correctAnswer: 0,
      explanation: "K-fold cross-validation nested within training data prevents data leakage and provides an unbiased estimate of generalization error on unseen test data.",
      keyConcept: "K-Fold Cross-Validation and Data Leakage Prevention"
    },
    {
      id: "q-aiml-4",
      competencyId: "ai_ml",
      difficulty: 2,
      scenario: "When deploying a deep neural network to parse tabular and OCR text data, an analyst notices that training loss approaches zero while validation loss increases.",
      question: "What modeling issue is occurring, and which technique helps remedy it?",
      options: [
        "Overfitting; apply regularization (Dropout, L1/L2 weight decay, or early stopping).",
        "Underfitting; increase model depth and training epochs.",
        "Vanishing gradient; remove all activation functions.",
        "Data sparsity; convert all numbers to floating point zeros."
      ],
      correctAnswer: 0,
      explanation: "Overfitting occurs when a model memorizes training noise rather than generalizable signals. Regularization penalizes model complexity to restore generalization.",
      keyConcept: "Overfitting and Regularization Techniques"
    },
    {
      id: "q-aiml-5",
      competencyId: "ai_ml",
      difficulty: 3,
      scenario: "Government statistical agencies implementing AI must comply with algorithmic explainability and fairness mandates.",
      question: "Which explainable AI (XAI) technique calculates Shapley values from cooperative game theory to quantify the exact marginal contribution of each feature to a specific prediction?",
      options: [
        "SHAP (SHapley Additive exPlanations)",
        "Principal Component Projection",
        "Linear OLS Slope Coefficients",
        "K-Means Centroid Distances"
      ],
      correctAnswer: 0,
      explanation: "SHAP values provide theoretically grounded feature attributions based on Shapley values, ensuring consistency and local accuracy in machine learning interpretations.",
      keyConcept: "SHAP Values and Algorithmic Explainability"
    }
  ],

  dpi: [
    {
      id: "q-dpi-1",
      competencyId: "dpi",
      difficulty: 1,
      scenario: "The Government of India has established a robust Digital Public Infrastructure (DPI) often referred to as the 'India Stack'.",
      question: "What are the three foundational layers of the India Stack?",
      options: [
        "Identity Layer (Aadhaar), Payment Layer (UPI), and Data Governance Layer (Account Aggregator / DigiLocker)",
        "Hardware Layer, Fibre Cable Layer, and Satellite Orbit Layer",
        "Search Engine Layer, Web Browser Layer, and Operating System Layer",
        "Tax Layer, Police Layer, and Passport Layer"
      ],
      correctAnswer: 0,
      explanation: "India Stack is architected in three layers: Identity (Aadhaar), Payments (UPI), and Data Exchange / Consent (DigiLocker, Account Aggregator).",
      keyConcept: "Foundational Layers of India Stack"
    },
    {
      id: "q-dpi-2",
      competencyId: "dpi",
      difficulty: 1,
      scenario: "Official statistical databases hosted in government cloud environments must conform to national data sovereignty and security directives.",
      question: "What is the official Government of India initiative that provides cloud computing environments for government departments under MeitY?",
      options: [
        "GI Cloud (MeghRaj)",
        "Public Commercial AWS S3",
        "Personal Cloud Storage",
        "Uncertified Private Server Colocation"
      ],
      correctAnswer: 0,
      explanation: "GI Cloud ('MeghRaj') is the Government of India initiative established by MeitY to deliver cloud infrastructure with standard security compliance.",
      keyConcept: "GI Cloud (MeghRaj) Infrastructure"
    },
    {
      id: "q-dpi-3",
      competencyId: "dpi",
      difficulty: 2,
      scenario: "A government data sharing initiative utilizes Open APIs to connect administrative databases between ministries.",
      question: "Which architectural principle is mandated under the National Data Sharing and Accessibility Policy (NDSAP) for public API endpoints?",
      options: [
        "Adoption of open standards, RESTful architectures, and standardized JSON/XML data formats",
        "Restricting all data transfer to proprietary binary database dumps",
        "Requiring manual paper authorization for every single API call",
        "Publishing unencrypted login credentials in URL parameters"
      ],
      correctAnswer: 0,
      explanation: "National data sharing guidelines require open, standardized, secure REST APIs to facilitate interoperability and eliminate redundant data silos.",
      keyConcept: "National Open API Standards & NDSAP"
    },
    {
      id: "q-dpi-4",
      competencyId: "dpi",
      difficulty: 2,
      scenario: "Statistical microdata sharing must respect user consent and privacy in compliance with Digital Public Infrastructure norms.",
      question: "What framework allows citizens and entities to view, manage, and revoke data-sharing consent across government and financial institutions?",
      options: [
        "Consent Manager / Electronic Consent Framework (DEPA)",
        "Public Bulletin Boards",
        "Irrevocable Blanket Disclosure Agreement",
        "Physical Notarized Affidavits"
      ],
      correctAnswer: 0,
      explanation: "The Data Empowerment and Protection Architecture (DEPA) and Consent Managers provide granular, auditable, and revocable consent mechanisms.",
      keyConcept: "Data Empowerment and Protection Architecture (DEPA)"
    },
    {
      id: "q-dpi-5",
      competencyId: "dpi",
      difficulty: 3,
      scenario: "An enterprise statistical registry integrates real-time administrative feeds from multiple government departments across state borders.",
      question: "Which federated data exchange standard facilitates cross-domain semantic interoperability across distinct departmental ontologies?",
      options: [
        "National Data and Analytics Platform (NDAP) standard schemas and ISO 11179 metadata registries",
        "CSV files without column headers",
        "Scraping static HTML tables via automated crawlers",
        "Manual telephone verification between officers"
      ],
      correctAnswer: 0,
      explanation: "Semantic interoperability relies on unified metadata registries (such as ISO 11179 and NDAP standard schemas) to harmonize cross-departmental administrative definitions.",
      keyConcept: "Semantic Interoperability and Federated Data Registries"
    }
  ],

  r_stats: [
    {
      id: "q-r-1",
      competencyId: "r_stats",
      difficulty: 1,
      scenario: "An analyst manipulates survey records in R using modern data science packages.",
      question: "Which package within the tidyverse ecosystem provides the core grammar of data manipulation (e.g. filter, select, mutate, summarise)?",
      options: ["dplyr", "ggplot2", "tidyr", "readr"],
      correctAnswer: 0,
      explanation: "dplyr is the fundamental R package providing intuitive verbs for filtering, selecting, mutating, and summarizing tabular data.",
      keyConcept: "dplyr Data Manipulation Verbs"
    },
    {
      id: "q-r-2",
      competencyId: "r_stats",
      difficulty: 1,
      scenario: "In survey statistical analysis in R, missing values are represented by special constants.",
      question: "What is the standard missing value symbol in R?",
      options: ["NA", "NULL", "NaN", "None"],
      correctAnswer: 0,
      explanation: "NA (Not Available) is R's native representation for missing data.",
      keyConcept: "Missing Value Representation in R"
    },
    {
      id: "q-r-3",
      competencyId: "r_stats",
      difficulty: 2,
      scenario: "An officer analyzes complex stratified cluster sample data in R.",
      question: "Which specialized R package is specifically engineered to analyze complex survey data with design weights, stratification, and cluster stages?",
      options: ["survey (Lumley)", "stats", "MASS", "lattice"],
      correctAnswer: 0,
      explanation: "The survey package by Thomas Lumley provides robust tools for specifying survey designs and computing design-based standard errors.",
      keyConcept: "R Survey Package for Complex Designs"
    },
    {
      id: "q-r-4",
      competencyId: "r_stats",
      difficulty: 2,
      scenario: "A publication graphic requires publication-quality statistical plotting based on Leland Wilkinson's Grammar of Graphics.",
      question: "Which R visualization library uses layered geometries (geom_point, geom_line) and aesthetic mappings (aes)?",
      options: ["ggplot2", "base plot", "graphics", "grid"],
      correctAnswer: 0,
      explanation: "ggplot2 implements the Grammar of Graphics, enabling elegant layered construction of charts.",
      keyConcept: "ggplot2 Grammar of Graphics"
    },
    {
      id: "q-r-5",
      competencyId: "r_stats",
      difficulty: 3,
      scenario: "An econometrician specifies an instrumental variables regression in R to address endogeneity.",
      question: "Which R function from the AER package implements two-stage least squares (2SLS) estimation?",
      options: ["ivreg()", "lm()", "glm()", "nls()"],
      correctAnswer: 0,
      explanation: "ivreg() in the AER package estimates two-stage least squares instrumental variable regressions.",
      keyConcept: "Instrumental Variables (2SLS) in R"
    }
  ],

  apis: [
    {
      id: "q-api-1",
      competencyId: "apis",
      difficulty: 1,
      scenario: "A client application fetches JSON records from an official government statistics API.",
      question: "Which HTTP status code signifies that the requested resource was successfully retrieved?",
      options: ["200 OK", "404 Not Found", "500 Internal Server Error", "301 Moved Permanently"],
      correctAnswer: 0,
      explanation: "HTTP status code 200 signifies a successful request.",
      keyConcept: "HTTP Status Codes"
    },
    {
      id: "q-api-2",
      competencyId: "apis",
      difficulty: 1,
      scenario: "An officer builds a RESTful web service to expose district-level CPI indicators.",
      question: "Which standard HTTP verb should be utilized for endpoints that retrieve data without modifying server state?",
      options: ["GET", "POST", "DELETE", "PUT"],
      correctAnswer: 0,
      explanation: "HTTP GET is an idempotent method used strictly to retrieve representations of resources.",
      keyConcept: "RESTful HTTP Verbs"
    },
    {
      id: "q-api-3",
      competencyId: "apis",
      difficulty: 2,
      scenario: "A departmental API gateway restricts how many queries an individual client can execute within a 60-second window to prevent denial-of-service.",
      question: "What security and governance pattern is being implemented?",
      options: ["Rate Limiting / Throttling", "Cross-Site Scripting", "SQL Injection", "Data Masking"],
      correctAnswer: 0,
      explanation: "Rate limiting controls the rate of traffic sent to an API, protecting infrastructure stability.",
      keyConcept: "API Rate Limiting and Traffic Throttling"
    },
    {
      id: "q-api-4",
      competencyId: "apis",
      difficulty: 2,
      scenario: "A client application needs to securely authenticate against an official government API without transmitting cleartext passwords on each call.",
      question: "Which industry standard protocol is widely used for delegated API authorization using Bearer tokens?",
      options: ["OAuth 2.0 / OpenID Connect", "FTP Basic Auth", "Telnet Handshake", "POP3 Authentication"],
      correctAnswer: 0,
      explanation: "OAuth 2.0 is the standard framework for token-based authorization and secure resource delegation.",
      keyConcept: "OAuth 2.0 Token Authorization"
    },
    {
      id: "q-api-5",
      competencyId: "apis",
      difficulty: 3,
      scenario: "Microdata API queries return large payloads of hundreds of thousands of records, causing network timeouts.",
      question: "Which API design practice splits large result sets into sequential manageable chunks using limit and offset or cursor tokens?",
      options: ["Pagination", "De-normalization", "Synchronous Polling", "Cache Invalidation"],
      correctAnswer: 0,
      explanation: "Cursor-based or offset pagination breaks heavy database responses into bounded pages to prevent memory and bandwidth saturation.",
      keyConcept: "API Pagination and Streaming Patterns"
    }
  ]
};

// Generic creator for remaining competencies to ensure ALL 25 competencies have at least 5 rich questions
competencies.forEach(c => {
  if (!questionBank[c.id]) {
    questionBank[c.id] = [
      {
        id: `q-${c.id}-1`,
        competencyId: c.id,
        difficulty: 1,
        scenario: `An officer in the ${c.category} wing is reviewing foundational guidelines and statutory mandates for ${c.name}.`,
        question: `What is the primary operational standard governing institutional compliance in ${c.name}?`,
        options: [
          `Adhering to verified MoSPI guidelines, standardized codebooks, and transparent documentation for ${c.name}.`,
          `Omitting audit trails to accelerate quarterly administrative submissions.`,
          `Relying on unofficial social media summaries instead of primary administrative records.`,
          `Substituting standardized definitions with ad-hoc personal preferences.`
        ],
        correctAnswer: 0,
        explanation: `Institutional standards require rigorous alignment with official methodologies, documentation, and quality protocols in ${c.name}.`,
        keyConcept: `Foundational Compliance in ${c.name}`
      },
      {
        id: `q-${c.id}-2`,
        competencyId: c.id,
        difficulty: 1,
        scenario: `During routine operational execution in ${c.name}, data validation highlights discrepancies across divisional returns.`,
        question: `Which basic procedural action is required when raw figures fail standard range checks?`,
        options: [
          `Flag the anomalous records, trace original source returns, and document verified corrections.`,
          `Silently overwrite the discrepancies without maintaining an audit log.`,
          `Delete all non-conforming administrative units from the final release.`,
          `Publish the raw unverified numbers with an arbitrary scaling factor.`
        ],
        correctAnswer: 0,
        explanation: `Quality assurance protocols mandate flagging non-conforming items, re-verifying primary records, and keeping transparent audit logs.`,
        keyConcept: `Validation and Audit Trails in ${c.name}`
      },
      {
        id: `q-${c.id}-3`,
        competencyId: c.id,
        difficulty: 2,
        scenario: `Statistical consolidation across states requires harmonizing diverse reporting formats under ${c.name}.`,
        question: `Which methodological approach guarantees national comparability across administrative tiers?`,
        options: [
          `Adopting unified classification frameworks and national standard schedules.`,
          `Allowing each state to invent independent item definitions.`,
          `Eliminating regional disaggregation in favor of a single national average.`,
          `Restricting reporting to only high-income districts.`
        ],
        correctAnswer: 0,
        explanation: `National comparability depends on unified classification codes, standardized definitions, and synchronized reference periods.`,
        keyConcept: `Harmonization and National Standards in ${c.name}`
      },
      {
        id: `q-${c.id}-4`,
        competencyId: c.id,
        difficulty: 2,
        scenario: `A supervisory review in ${c.name} evaluates workflow efficiency and operational risk management.`,
        question: `How should statistical supervisory teams mitigate operational bottleneck risks during peak publication periods?`,
        options: [
          `Implement automated batch validation pipelines and multi-tier quality sign-offs.`,
          `Bypass peer-review and accuracy checks during peak publication cycles.`,
          `Outsource core analytical decision-making to uncertified entities.`,
          `Cease all data updates until the next fiscal quarter.`
        ],
        correctAnswer: 0,
        explanation: `Automated validation and structured peer-review sign-offs reduce bottleneck risks while preserving analytical rigor.`,
        keyConcept: `Operational Risk Management in ${c.name}`
      },
      {
        id: `q-${c.id}-5`,
        competencyId: c.id,
        difficulty: 3,
        scenario: `An advanced modernization initiative in ${c.name} is tasked with integrating real-time telemetry and secondary administrative microdata.`,
        question: `What critical technical requirement must be met before combining external administrative registers with official statistical benchmarks?`,
        options: [
          `Rigorous statistical linkage validation, deduplication, and privacy-preserving disclosure limitation.`,
          `Unchecked merging of disparate tables without matching primary keys.`,
          `Exposing unanonymized personally identifiable information (PII) to external portals.`,
          `Discarding verified historic benchmarks in favor of uncurated real-time feeds.`
        ],
        correctAnswer: 0,
        explanation: `Modern statistical data integration demands rigorous entity resolution, deduplication, linkage validation, and strict privacy protection.`,
        keyConcept: `Advanced Data Integration Standards in ${c.name}`
      }
    ];
  }
});

// Flatten all questions and merge with existing
const finalQuestions = [];
const seenIds = new Set();

// First add curated questions
Object.keys(questionBank).forEach(compId => {
  const qList = questionBank[compId];
  qList.forEach(q => {
    if (!seenIds.has(q.id)) {
      finalQuestions.push(q);
      seenIds.add(q.id);
    }
  });
});

// Also preserve any unique questions from previous existing questions
existing.forEach(q => {
  if (!seenIds.has(q.id)) {
    finalQuestions.push(q);
    seenIds.add(q.id);
  }
});

fs.writeFileSync(questionsPath, JSON.stringify(finalQuestions, null, 2), 'utf8');

console.log(`Total questions in final bank: ${finalQuestions.length}`);

// Verify every competency has at least 5 questions
const counts = {};
finalQuestions.forEach(q => {
  counts[q.competencyId] = (counts[q.competencyId] || 0) + 1;
});

let allPass = true;
competencies.forEach(c => {
  const count = counts[c.id] || 0;
  if (count < 5) allPass = false;
  console.log(`- ${c.id}: ${count} questions`);
});

console.log(allPass ? 'SUCCESS: All 25 competencies have at least 5 questions!' : 'FAILURE: Some competencies have <5 questions.');
