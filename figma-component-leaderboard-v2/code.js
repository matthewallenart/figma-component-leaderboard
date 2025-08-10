// Figma Plugin Backend Code
figma.showUI(__html__, { 
  width: 400, 
  height: 600,
  themeColors: true 
});

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'get-component-data') {
    try {
      // Load all pages first (required for dynamic-page access)
      await figma.loadAllPagesAsync();
      
      // Get all components in the current file
      const components = figma.root.findAll(node => 
        node.type === 'COMPONENT' || node.type === 'COMPONENT_SET'
      );
      
      console.log(`Found ${components.length} components in the file`);
      
      // Track component contributions
      const contributorData = analyzeContributions(components);
      
      // Send data back to UI
      figma.ui.postMessage({
        type: 'component-data-response',
        data: contributorData
      });
    } catch (error) {
      console.error('Error loading component data:', error);
      
      // Send fallback data if there's an error
      const fallbackData = generateFallbackData();
      figma.ui.postMessage({
        type: 'component-data-response',
        data: fallbackData
      });
    }
  }
  
  if (msg.type === 'close-plugin') {
    figma.closePlugin();
  }
};

// Analyze component contributions
function analyzeContributions(components) {
  // Get current user and file info
  const currentUser = figma.currentUser;
  const yourName = currentUser ? currentUser.name : 'Current User';
  const fileName = figma.root.name || 'Untitled File';
  
  console.log(`User: ${yourName}, File: ${fileName}`);
  
  // If no components, show empty state for just the current user
  if (components.length === 0) {
    return [
      {
        id: 1,
        name: yourName,
        subtitle: 'The Aesthetic Apex',
        stats: {
          newComponents: 0,
          updates: 0,
          bugFixes: 0,
          documentation: 0,
          total: 0
        }
      }
    ];
  }
  
  // Count real component data
  const totalComponents = components.length;
  const documentedComponents = components.filter(comp => 
    comp.description && comp.description.trim().length > 0
  ).length;
  const componentSets = components.filter(comp => comp.type === 'COMPONENT_SET').length;
  const regularComponents = components.filter(comp => comp.type === 'COMPONENT').length;
  
  console.log(`Total: ${totalComponents}, Sets: ${componentSets}, Regular: ${regularComponents}, Documented: ${documentedComponents}`);
  
  // Only show the actual contributor (current user) - they get gold/first place
  return [
    {
      id: 1,
      name: yourName,
      subtitle: 'The Aesthetic Apex',
      stats: {
        newComponents: totalComponents,
        updates: componentSets,
        bugFixes: 0,
        documentation: documentedComponents,
        total: totalComponents + componentSets + documentedComponents
      }
    }
  ];
}

// Function to get rank-based titles
function getRankTitle(rank) {
  switch (rank) {
    case 1:
      return 'The Aesthetic Apex';
    case 2:
      return 'Figma Phenom';
    case 3:
      return 'The Blueprint Baron';
    default:
      return 'Design Contributor';
  }
}

function generateFallbackData() {
  return [
    {
      id: 1,
      name: 'Plugin Error',
      subtitle: 'Could not load data',
      stats: {
        newComponents: 0,
        updates: 0,
        bugFixes: 0,
        documentation: 0,
        total: 0
      }
    }
  ];
}

function getContributorName(id) {
  const names = [
    'Sarah Chen',
    'Marcus Johnson', 
    'Emily Rodriguez',
    'Alex Kim',
    'Jordan Taylor',
    'Maya Patel',
    'David Wilson',
    'Lisa Zhang'
  ];
  return names[id - 1] || names[Math.floor(Math.random() * names.length)];
}

// Initialize plugin and send initial data
async function initializePlugin() {
  try {
    await figma.loadAllPagesAsync();
    
    const components = figma.root.findAll(node => 
      node.type === 'COMPONENT' || node.type === 'COMPONENT_SET'
    );
    
    const contributorData = analyzeContributions(components);
    
    figma.ui.postMessage({
      type: 'component-data-response',
      data: contributorData
    });
    
    console.log('Plugin initialized successfully');
  } catch (error) {
    console.error('Error initializing plugin:', error);
    
    const fallbackData = generateFallbackData();
    figma.ui.postMessage({
      type: 'component-data-response',
      data: fallbackData
    });
  }
}

// Auto-initialize when plugin loads
initializePlugin();