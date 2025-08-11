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

// Analyze component contributions with achievements
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
        },
        achievements: []
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
  
  // Calculate achievements
  const achievements = calculateAchievements({
    totalComponents,
    componentSets,
    documentedComponents,
    regularComponents
  });
  
  // Calculate total score including achievement bonuses
  const baseScore = totalComponents + componentSets + documentedComponents;
  const achievementBonus = achievements.reduce((sum, achievement) => {
    const bonus = parseInt(achievement.bonus.replace('+', '')) || 0;
    return sum + bonus;
  }, 0);
  
  // Only show the actual contributor (current user) - they get gold/first place
  return [
    {
      id: 1,
      name: yourName,
      subtitle: getRankTitle(1),
      stats: {
        newComponents: totalComponents,
        updates: componentSets,
        bugFixes: 0, // Could be enhanced to track actual bug fixes
        documentation: documentedComponents,
        total: baseScore + achievementBonus
      },
      achievements: achievements
    }
  ];
}

// Calculate achievements based on component data
function calculateAchievements(data) {
  const achievements = [];
  
  // Documentation Hero - if more than 50% of components are documented
  if (data.totalComponents > 0 && (data.documentedComponents / data.totalComponents) > 0.5) {
    achievements.push({
      icon: '📚',
      text: 'Documentation hero',
      bonus: '+3'
    });
  }
  
  // Component Master - if they have more than 10 components
  if (data.totalComponents > 10) {
    achievements.push({
      icon: '🎨',
      text: 'Component Master',
      bonus: '+5'
    });
  }
  
  // System Architect - if they have more than 5 component sets
  if (data.componentSets > 5) {
    achievements.push({
      icon: '🏗️',
      text: 'System Architect',
      bonus: '+4'
    });
  }
  
  // Consistency Champion - if all components are documented
  if (data.totalComponents > 0 && data.documentedComponents === data.totalComponents) {
    achievements.push({
      icon: '✨',
      text: 'Consistency Champion',
      bonus: '+2'
    });
  }
  
  // Prolific Creator - if they have more than 20 components
  if (data.totalComponents > 20) {
    achievements.push({
      icon: '🚀',
      text: 'Prolific Creator',
      bonus: '+6'
    });
  }
  
  return achievements;
}

// Function to get rank-based titles
function getRankTitle(rank) {
  switch (rank) {
    case 1:
      return 'The Aesthetic Apex';
    case 2:
      return 'Design Virtuoso';
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
      },
      achievements: []
    }
  ];
}

// Enhanced data generation for demo purposes
function generateDemoData() {
  const currentUser = figma.currentUser;
  const yourName = currentUser ? currentUser.name : 'Alex Dolan';
  
  return [
    {
      id: 1,
      name: yourName,
      subtitle: 'The Aesthetic Apex',
      stats: {
        newComponents: 12,
        updates: 34,
        bugFixes: 12,
        documentation: 12,
        total: 72
      },
      achievements: [
        { icon: '📚', text: 'Documentation hero', bonus: '+3' }
      ]
    },
    {
      id: 2,
      name: 'Arianna Vettraino',
      subtitle: 'Design Virtuoso',
      stats: {
        newComponents: 12,
        updates: 34,
        bugFixes: 12,
        documentation: 12,
        total: 71
      },
      achievements: [
        { icon: '🐛', text: 'Bug Squasher', bonus: '+2' }
      ]
    },
    {
      id: 3,
      name: 'Matthew Allen',
      subtitle: 'The Blueprint Baron',
      stats: {
        newComponents: 15,
        updates: 22,
        bugFixes: 4,
        documentation: 12,
        total: 69
      },
      achievements: [
        { icon: '🎨', text: 'Component Master', bonus: '+5' }
      ]
    }
  ];
}

// Initialize plugin and send initial data
async function initializePlugin() {
  try {
    await figma.loadAllPagesAsync();
    
    const components = figma.root.findAll(node => 
      node.type === 'COMPONENT' || node.type === 'COMPONENT_SET'
    );
    
    // Use demo data if no components found for better showcase
    let contributorData;
    if (components.length === 0) {
      contributorData = generateDemoData();
    } else {
      contributorData = analyzeContributions(components);
    }
    
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