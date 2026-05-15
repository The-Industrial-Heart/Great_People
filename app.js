const STORAGE_KEY = "greatPeopleState.v1";
const OWNER_CODE = "chatt-owner";

function createId() {
  return crypto.randomUUID?.() || `provider-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const starterProviders = [
  {
    id: createId(),
    name: "Lookout Valley Plumbing Co.",
    trade: "Plumbing",
    capabilities: ["emergency leaks", "water heaters", "sewer line repair", "fixture installs"],
    contact: "(423) 555-0108",
    website: "Usually available for after-hours emergencies in Hamilton County.",
    status: "approved",
    endorsements: [
      {
        endorser: "Maya T.",
        project: "Replaced a failed water heater and corrected old shutoff valves.",
        cost: "$1,875",
        notes: "Arrived same day, documented parts, and cleaned up the utility room.",
      },
      {
        endorser: "Eli R.",
        project: "Diagnosed recurring kitchen drain backup.",
        cost: "$425",
        notes: "Explained the problem clearly and avoided unnecessary line replacement.",
      },
    ],
  },
  {
    id: createId(),
    name: "River City Electric",
    trade: "Electrical",
    capabilities: ["panel upgrades", "EV chargers", "outdoor lighting", "permit coordination"],
    contact: "hello@rivercity.example",
    website: "Licensed electrician; best for planned work booked 2+ weeks ahead.",
    status: "approved",
    endorsements: [
      {
        endorser: "Jordan P.",
        project: "Installed a Level 2 EV charger and added a dedicated breaker.",
        cost: "$1,150",
        notes: "Handled inspection scheduling and labeled the panel before leaving.",
      },
    ],
  },
  {
    id: createId(),
    name: "Northshore Carpentry & Decks",
    trade: "Carpentry",
    capabilities: ["deck repair", "stairs", "rot remediation", "porch railings"],
    contact: "(423) 555-0172",
    website: "Text photos first for faster estimates.",
    status: "approved",
    endorsements: [
      {
        endorser: "Sam K.",
        project: "Rebuilt unsafe deck stairs and replaced rotten railing posts.",
        cost: "$3,400",
        notes: "Matched the existing deck style and finished before a family event.",
      },
    ],
  },
  {
    id: createId(),
    name: "Signal Mountain HVAC Help",
    trade: "HVAC",
    capabilities: ["heat pump repair", "seasonal tune ups", "duct balancing", "thermostats"],
    contact: "(423) 555-0134",
    website: "Strong troubleshooting before recommending replacement.",
    status: "approved",
    endorsements: [
      {
        endorser: "Priya N.",
        project: "Repaired heat pump capacitor during a July outage.",
        cost: "$295",
        notes: "Had the part on the truck and explained maintenance steps.",
      },
    ],
  },
];

const starterState = {
  providers: starterProviders,
  contributors: ["Owner", "Maya T.", "Eli R.", "Jordan P.", "Sam K.", "Priya N."],
  pendingAccess: ["Avery L."],
  ownerUnlocked: false,
};

const state = loadState();
let selectedCapability = "";
let searchQuery = "";

const providerGrid = document.querySelector("#provider-grid");
const providerTemplate = document.querySelector("#provider-card-template");
const capabilityFilters = document.querySelector("#capability-filters");
const emptyState = document.querySelector("#empty-state");
const resultsTitle = document.querySelector("#results-title");
const providerCount = document.querySelector("#provider-count");
const endorsementCount = document.querySelector("#endorsement-count");
const ownerTools = document.querySelector("#owner-tools");
const ownerStatus = document.querySelector("#owner-status");
const approvedList = document.querySelector("#approved-list");
const pendingList = document.querySelector("#pending-list");
const submissionList = document.querySelector("#submission-list");

function loadState() {
  const storedState = localStorage.getItem(STORAGE_KEY);

  if (!storedState) {
    return structuredClone(starterState);
  }

  try {
    return { ...structuredClone(starterState), ...JSON.parse(storedState) };
  } catch {
    return structuredClone(starterState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalize(value) {
  return value.toLowerCase().trim();
}

function getApprovedProviders() {
  return state.providers.filter((provider) => provider.status === "approved" || state.ownerUnlocked);
}

function providerMatches(provider) {
  const searchable = [
    provider.name,
    provider.trade,
    provider.contact,
    provider.website,
    provider.capabilities.join(" "),
    ...provider.endorsements.flatMap((endorsement) => [
      endorsement.endorser,
      endorsement.project,
      endorsement.cost,
      endorsement.notes,
    ]),
  ]
    .join(" ")
    .toLowerCase();

  const matchesQuery = !searchQuery || searchable.includes(searchQuery);
  const matchesCapability = !selectedCapability || provider.capabilities.includes(selectedCapability);

  return matchesQuery && matchesCapability;
}

function renderProviders() {
  const providers = getApprovedProviders().filter(providerMatches);
  providerGrid.innerHTML = "";

  providers.forEach((provider) => {
    const card = providerTemplate.content.firstElementChild.cloneNode(true);
    card.querySelector("h3").textContent = provider.name;
    card.querySelector(".trade-pill").textContent = provider.trade;
    card.querySelector(".status-pill").textContent = provider.status === "approved" ? "Approved" : "Pending owner review";
    card.querySelector(".capability-line").textContent = `Can help with: ${provider.capabilities.join(", ")}`;
    card.querySelector(".contact-line").textContent = `${provider.contact} • ${provider.website || "No extra notes yet"}`;

    const endorsementBox = card.querySelector(".endorsement-box");
    provider.endorsements.forEach((endorsement) => {
      const endorsementElement = document.createElement("div");
      const endorser = document.createElement("strong");
      const project = document.createElement("p");
      const cost = document.createElement("p");
      const costLabel = document.createElement("b");
      const notes = document.createElement("p");

      endorsementElement.className = "endorsement";
      endorser.textContent = endorsement.endorser;
      project.textContent = endorsement.project;
      costLabel.textContent = "Cost:";
      cost.append(costLabel, ` ${endorsement.cost}`);
      notes.textContent = endorsement.notes || "No additional notes.";
      endorsementElement.append(endorser, project, cost, notes);
      endorsementBox.append(endorsementElement);
    });

    providerGrid.append(card);
  });

  emptyState.hidden = providers.length > 0;
  resultsTitle.textContent = `${providers.length} recommended provider${providers.length === 1 ? "" : "s"}`;
}

function renderCapabilityFilters() {
  const capabilityCounts = state.providers
    .filter((provider) => provider.status === "approved")
    .flatMap((provider) => provider.capabilities)
    .reduce((counts, capability) => {
      counts.set(capability, (counts.get(capability) || 0) + 1);
      return counts;
    }, new Map());

  capabilityFilters.innerHTML = "";
  [...capabilityCounts.entries()].sort().forEach(([capability, count]) => {
    const button = document.createElement("button");
    button.className = `filter-chip${selectedCapability === capability ? " active" : ""}`;
    button.type = "button";
    const capabilityLabel = document.createElement("span");
    const capabilityCount = document.createElement("strong");
    capabilityLabel.textContent = capability;
    capabilityCount.textContent = count;
    button.append(capabilityLabel, capabilityCount);
    button.addEventListener("click", () => {
      selectedCapability = selectedCapability === capability ? "" : capability;
      render();
    });
    capabilityFilters.append(button);
  });
}

function renderCounts() {
  const approvedProviders = state.providers.filter((provider) => provider.status === "approved");
  providerCount.textContent = approvedProviders.length;
  endorsementCount.textContent = approvedProviders.reduce(
    (total, provider) => total + provider.endorsements.length,
    0,
  );
}

function renderAccessLists() {
  ownerTools.hidden = !state.ownerUnlocked;
  ownerStatus.textContent = state.ownerUnlocked
    ? "Owner tools are unlocked on this device for this demo session."
    : "Owner tools are locked on this device.";

  approvedList.innerHTML = "";
  state.contributors.forEach((contributor) => {
    const item = document.createElement("li");
    item.textContent = contributor;
    approvedList.append(item);
  });

  pendingList.innerHTML = "";
  state.pendingAccess.forEach((requester) => {
    const item = document.createElement("li");
    const requesterName = document.createElement("span");
    requesterName.textContent = requester;
    item.append(requesterName);
    const approveButton = document.createElement("button");
    approveButton.className = "secondary-button";
    approveButton.type = "button";
    approveButton.textContent = "Approve";
    approveButton.addEventListener("click", () => approveContributor(requester));
    item.append(approveButton);
    pendingList.append(item);
  });

  submissionList.innerHTML = "";
  state.providers
    .filter((provider) => provider.status === "pending")
    .forEach((provider) => {
      const item = document.createElement("li");
      const providerLabel = document.createElement("span");
      const providerTrade = document.createElement("small");
      providerLabel.textContent = `${provider.name} `;
      providerTrade.textContent = `(${provider.trade})`;
      providerLabel.append(providerTrade);
      item.append(providerLabel);
      const approveButton = document.createElement("button");
      approveButton.className = "secondary-button";
      approveButton.type = "button";
      approveButton.textContent = "Approve";
      approveButton.addEventListener("click", () => approveProvider(provider.id));
      item.append(approveButton);
      submissionList.append(item);
    });

  if (!submissionList.children.length) {
    const item = document.createElement("li");
    item.textContent = "No pending provider submissions.";
    submissionList.append(item);
  }
}

function render() {
  renderCounts();
  renderCapabilityFilters();
  renderProviders();
  renderAccessLists();
}

function approveContributor(requester) {
  if (!state.contributors.includes(requester)) {
    state.contributors.push(requester);
  }
  state.pendingAccess = state.pendingAccess.filter((pendingRequester) => pendingRequester !== requester);
  saveState();
  render();
}

function approveProvider(providerId) {
  const provider = state.providers.find(({ id }) => id === providerId);
  if (provider) {
    provider.status = "approved";
    saveState();
    render();
  }
}

function openPanel(panelId) {
  const panel = document.querySelector(`#${panelId}`);
  panel.classList.add("is-open");
  panel.setAttribute("aria-hidden", "false");
}

function closePanels() {
  document.querySelectorAll(".side-panel").forEach((panel) => {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
  });
}

document.querySelectorAll("[data-open-panel]").forEach((button) => {
  button.addEventListener("click", () => openPanel(button.dataset.openPanel));
});

document.querySelectorAll("[data-close-panel]").forEach((button) => {
  button.addEventListener("click", closePanels);
});

document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  searchQuery = normalize(document.querySelector("#search-input").value);
  renderProviders();
});

document.querySelector("#search-input").addEventListener("input", (event) => {
  searchQuery = normalize(event.target.value);
  renderProviders();
});

document.querySelector("#clear-filters").addEventListener("click", () => {
  selectedCapability = "";
  searchQuery = "";
  document.querySelector("#search-input").value = "";
  render();
});

document.querySelector("#provider-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const capabilities = data
    .get("capabilities")
    .split(",")
    .map((capability) => normalize(capability))
    .filter(Boolean);

  state.providers.unshift({
    id: createId(),
    name: data.get("name").trim(),
    trade: data.get("trade").trim(),
    capabilities,
    contact: data.get("contact").trim(),
    website: data.get("website").trim(),
    status: state.ownerUnlocked ? "approved" : "pending",
    endorsements: [
      {
        endorser: data.get("endorser").trim(),
        project: data.get("project").trim(),
        cost: data.get("cost").trim(),
        notes: data.get("notes").trim(),
      },
    ],
  });

  saveState();
  event.currentTarget.reset();
  closePanels();
  render();
});

document.querySelector("#unlock-owner").addEventListener("click", () => {
  const enteredCode = document.querySelector("#owner-code").value;
  state.ownerUnlocked = enteredCode === OWNER_CODE;
  ownerStatus.textContent = state.ownerUnlocked
    ? "Owner tools unlocked. You can now approve access and submissions."
    : "That code did not match. Demo hint: chatt-owner";
  saveState();
  render();
});

document.querySelector("#request-access-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const requester = new FormData(event.currentTarget).get("requester").trim();
  if (requester && !state.pendingAccess.includes(requester) && !state.contributors.includes(requester)) {
    state.pendingAccess.push(requester);
  }
  saveState();
  event.currentTarget.reset();
  renderAccessLists();
});

document.querySelector("#copy-invite").addEventListener("click", async () => {
  const invite = `${location.origin}${location.pathname}?invite=trusted-circle`;
  await navigator.clipboard.writeText(invite);
  document.querySelector("#copy-invite").textContent = "Invite link copied";
  setTimeout(() => {
    document.querySelector("#copy-invite").textContent = "Copy invite link";
  }, 1800);
});

if (new URLSearchParams(location.search).has("invite")) {
  openPanel("access-panel");
}

render();
