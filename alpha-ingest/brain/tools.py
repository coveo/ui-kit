"""
Neo4j Tools for the LangGraph Agent.

These tools query the knowledge graph to answer questions about the codebase.
"""

from typing import Optional
from langchain_core.tools import tool
from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()

# Neo4j connection
_driver = None


def get_driver():
    global _driver
    if _driver is None:
        _driver = GraphDatabase.driver(
            os.getenv("NEO4J_URI", "bolt://localhost:7687"),
            auth=(os.getenv("NEO4J_USER", "neo4j"), os.getenv("NEO4J_PASSWORD", "password")),
        )
    return _driver


def run_query(query: str, params: Optional[dict] = None) -> list[dict]:
    """Execute a Cypher query and return results as list of dicts."""
    with get_driver().session() as session:
        result = session.run(query, params or {})
        return [record.data() for record in result]


# =============================================================================
# TOOLS
# =============================================================================


@tool
def find_component(tag: str) -> str:
    """Find an Atomic component by its tag name (e.g., 'atomic-search-box').
    Returns component details, controllers it consumes, and its properties."""
    
    results = run_query(
        """
        MATCH (c:Component)
        WHERE c.tag CONTAINS $tag
        OPTIONAL MATCH (c)-[:CONSUMES]->(ctrl:Controller)
        OPTIONAL MATCH (c)-[:HAS_PROPERTY]->(p:Property)
        RETURN c.tag as tag, c.file as file, 
               collect(DISTINCT ctrl.name) as controllers,
               collect(DISTINCT {name: p.name, attribute: p.attribute, type: p.type, defaultValue: p.defaultValue}) as properties
        LIMIT 10
        """,
        {"tag": tag},
    )
    
    if not results:
        return f"No components found matching '{tag}'"
    
    output = []
    for r in results:
        controllers = [c for c in r.get("controllers", []) if c]
        ctrl_str = ", ".join(controllers) if controllers else "none"
        
        props = [p for p in r.get("properties", []) if p.get("name")]
        props_str = ""
        if props:
            props_str = "\n  Properties:\n"
            for p in props[:10]:
                props_str += f"    - {p['name']} ({p.get('attribute', '?')}): {p.get('type', '?')} = {p.get('defaultValue', 'undefined')}\n"
            if len(props) > 10:
                props_str += f"    ... and {len(props) - 10} more properties\n"
        
        output.append(f"- {r['tag']}\n  File: {r['file']}\n  Controllers: {ctrl_str}{props_str}")
    
    return "\n".join(output)


@tool
def find_controller(name: str) -> str:
    """Find a Headless controller by name (e.g., 'SearchBox').
    Returns controller details and the actions it dispatches."""
    
    results = run_query(
        """
        MATCH (ctrl:Controller)
        WHERE ctrl.name CONTAINS $name
        OPTIONAL MATCH (ctrl)-[:DISPATCHES]->(a:Action)
        RETURN ctrl.name as name, ctrl.file as file, ctrl.buildFunction as buildFunc,
               collect({name: a.name, type: a.type}) as actions
        LIMIT 10
        """,
        {"name": name},
    )
    
    if not results:
        return f"No controllers found matching '{name}'"
    
    output = []
    for r in results:
        actions = [f"{a['name']} ({a['type']})" for a in r.get("actions", []) if a.get("name")]
        actions_str = ", ".join(actions[:5]) if actions else "none"
        if len(actions) > 5:
            actions_str += f" ... and {len(actions) - 5} more"
        output.append(
            f"- {r['name']} (build function: {r.get('buildFunc', 'unknown')})\n"
            f"  File: {r['file']}\n"
            f"  Dispatches: {actions_str}"
        )
    
    return "\n".join(output)


@tool
def trace_component_to_actions(tag: str) -> str:
    """Trace the full path from an Atomic component to the Redux actions it triggers.
    Shows: Component → Controller → Actions."""
    
    results = run_query(
        """
        MATCH (c:Component {tag: $tag})-[:CONSUMES]->(ctrl:Controller)-[:DISPATCHES]->(a:Action)
        RETURN c.tag as component, ctrl.name as controller, 
               collect({name: a.name, type: a.type, kind: a.kind}) as actions
        """,
        {"tag": tag},
    )
    
    if not results:
        return f"No action trace found for component '{tag}'. Component may not exist or has no controller links."
    
    output = [f"Action trace for {tag}:\n"]
    for r in results:
        output.append(f"\n→ Controller: {r['controller']}")
        for action in r.get("actions", []):
            if action.get("name"):
                output.append(f"  → Action: {action['name']} ({action.get('type', '?')}) [{action.get('kind', '?')}]")
    
    return "\n".join(output)


@tool
def find_action_handlers(action_type: str) -> str:
    """Find which reducers handle a specific action type (e.g., 'search/executeSearch').
    Useful for understanding state changes triggered by an action."""
    
    results = run_query(
        """
        MATCH (r:Reducer)-[:HANDLES]->(a:Action)
        WHERE a.type CONTAINS $actionType OR a.name CONTAINS $actionType
        RETURN r.name as reducer, r.file as file, a.name as action, a.type as actionType
        LIMIT 20
        """,
        {"actionType": action_type},
    )
    
    if not results:
        return f"No reducers found handling actions matching '{action_type}'"
    
    output = [f"Reducers handling '{action_type}':\n"]
    for r in results:
        output.append(f"- {r['reducer']} handles {r['action']} ({r.get('actionType', '?')})\n  File: {r['file']}")
    
    return "\n".join(output)


@tool
def list_package_dependencies(package_name: str) -> str:
    """List dependencies of a package (e.g., '@coveo/atomic').
    Shows what other @coveo packages it depends on."""
    
    results = run_query(
        """
        MATCH (p:Package)
        WHERE p.name CONTAINS $name
        OPTIONAL MATCH (p)-[:DEPENDS_ON]->(dep:Package)
        OPTIONAL MATCH (p)-[:DEV_DEPENDS_ON]->(devDep:Package)
        OPTIONAL MATCH (p)-[:PEER_DEPENDS_ON]->(peerDep:Package)
        RETURN p.name as package, p.path as path,
               collect(DISTINCT dep.name) as dependencies,
               collect(DISTINCT devDep.name) as devDependencies,
               collect(DISTINCT peerDep.name) as peerDependencies
        LIMIT 5
        """,
        {"name": package_name},
    )
    
    if not results:
        return f"No packages found matching '{package_name}'"
    
    output = []
    for r in results:
        deps = [d for d in r.get("dependencies", []) if d]
        dev_deps = [d for d in r.get("devDependencies", []) if d]
        peer_deps = [d for d in r.get("peerDependencies", []) if d]
        
        output.append(f"Package: {r['package']} ({r.get('path', '?')})")
        output.append(f"  Dependencies: {', '.join(deps) if deps else 'none'}")
        output.append(f"  Dev Dependencies: {', '.join(dev_deps) if dev_deps else 'none'}")
        output.append(f"  Peer Dependencies: {', '.join(peer_deps) if peer_deps else 'none'}")
    
    return "\n".join(output)


@tool
def find_component_properties(tag: str) -> str:
    """Get all properties (attributes) of an Atomic component.
    Returns property name, HTML attribute, type, default value, and description.
    Use this to understand what props a component exposes."""
    
    results = run_query(
        """
        MATCH (c:Component)-[:HAS_PROPERTY]->(p:Property)
        WHERE c.tag CONTAINS $tag
        RETURN c.tag as component, p.name as name, p.attribute as attribute, 
               p.type as type, p.defaultValue as defaultValue, 
               p.reflect as reflect, p.description as description
        ORDER BY p.name
        """,
        {"tag": tag},
    )
    
    if not results:
        return f"No properties found for component matching '{tag}'. The component may not exist or has no @property() decorators."
    
    # Group by component
    by_component: dict[str, list] = {}
    for r in results:
        comp = r.get("component", "unknown")
        if comp not in by_component:
            by_component[comp] = []
        by_component[comp].append(r)
    
    output = []
    for comp, props in by_component.items():
        output.append(f"Properties for {comp} ({len(props)} total):\n")
        for p in props:
            desc = p.get("description", "")
            desc_str = f"\n      Description: {desc[:100]}..." if desc and len(desc) > 100 else (f"\n      Description: {desc}" if desc else "")
            reflect_str = " [reflects]" if p.get("reflect") else ""
            output.append(
                f"  - {p['name']} (attribute: {p.get('attribute', '?')}){reflect_str}\n"
                f"      Type: {p.get('type', '?')}\n"
                f"      Default: {p.get('defaultValue', 'undefined')}{desc_str}"
            )
        output.append("")
    
    return "\n".join(output)


@tool
def find_property_usage(property_name: str) -> str:
    """Find which components use a specific property name.
    Useful for impact analysis when removing or renaming a property."""
    
    results = run_query(
        """
        MATCH (c:Component)-[:HAS_PROPERTY]->(p:Property)
        WHERE p.name CONTAINS $propName OR p.attribute CONTAINS $propName
        RETURN c.tag as component, c.file as file, p.name as property, 
               p.attribute as attribute, p.type as type, p.defaultValue as defaultValue
        ORDER BY c.tag
        """,
        {"propName": property_name},
    )
    
    if not results:
        return f"No components found with property matching '{property_name}'"
    
    output = [f"Components with property matching '{property_name}':\n"]
    for r in results:
        output.append(
            f"- {r['component']}\n"
            f"    Property: {r['property']} (attribute: {r.get('attribute', '?')})\n"
            f"    Type: {r.get('type', '?')} = {r.get('defaultValue', 'undefined')}\n"
            f"    File: {r['file']}"
        )
    
    return "\n".join(output)


@tool
def analyze_property_impact(component_tag: str, property_name: str) -> str:
    """Analyze the impact of removing a property from a component.
    Shows the property details, the component's controllers, and related actions."""
    
    # Get property details
    prop_results = run_query(
        """
        MATCH (c:Component {tag: $tag})-[:HAS_PROPERTY]->(p:Property)
        WHERE p.name = $propName OR p.attribute = $propName
        RETURN p.name as name, p.attribute as attribute, p.type as type, 
               p.defaultValue as defaultValue, p.description as description
        """,
        {"tag": component_tag, "propName": property_name},
    )
    
    # Get component's controllers and actions
    ctrl_results = run_query(
        """
        MATCH (c:Component {tag: $tag})-[:CONSUMES]->(ctrl:Controller)
        OPTIONAL MATCH (ctrl)-[:DISPATCHES]->(a:Action)
        RETURN ctrl.name as controller, collect({name: a.name, type: a.type}) as actions
        """,
        {"tag": component_tag},
    )
    
    output = [f"=== Impact Analysis: Removing '{property_name}' from {component_tag} ===\n"]
    
    if prop_results:
        p = prop_results[0]
        output.append("Property Details:")
        output.append(f"  Name: {p.get('name', '?')}")
        output.append(f"  HTML Attribute: {p.get('attribute', '?')}")
        output.append(f"  Type: {p.get('type', '?')}")
        output.append(f"  Default Value: {p.get('defaultValue', 'undefined')}")
        if p.get("description"):
            output.append(f"  Description: {p['description']}")
        output.append("")
    else:
        output.append(f"WARNING: Property '{property_name}' not found in {component_tag}")
        output.append("This could mean:")
        output.append("  - The property doesn't exist")
        output.append("  - It's defined differently (check the actual source file)")
        output.append("  - The graph needs to be rescanned")
        output.append("")
    
    if ctrl_results:
        output.append("Connected Controllers and Actions:")
        for r in ctrl_results:
            output.append(f"\n  Controller: {r['controller']}")
            actions = [a for a in r.get("actions", []) if a.get("name")]
            if actions:
                for a in actions[:5]:
                    output.append(f"    → {a['name']} ({a.get('type', '?')})")
                if len(actions) > 5:
                    output.append(f"    ... and {len(actions) - 5} more actions")
    else:
        output.append("No controllers connected to this component.")
    
    output.append("\n\nRecommendations:")
    output.append("1. Search the codebase for usages of this property/attribute")
    output.append("2. Check if any samples or documentation reference this property")
    output.append("3. Consider deprecation before removal")
    
    return "\n".join(output)


@tool
def run_cypher(query: str) -> str:
    """Run a custom Cypher query against the knowledge graph.
    Use this for complex queries not covered by other tools.
    
    Available node types: Package, Component, Controller, Action, Reducer, Application, Property
    Available relationships: CONTAINS, CONSUMES, DISPATCHES, HANDLES, DEPENDS_ON, 
                            DEV_DEPENDS_ON, PEER_DEPENDS_ON, USES_COMPONENT, HAS_PROPERTY
    """
    
    try:
        results = run_query(query)
        if not results:
            return "Query returned no results"
        
        # Format results nicely
        output = []
        for i, record in enumerate(results[:20]):
            output.append(f"[{i + 1}] {record}")
        
        if len(results) > 20:
            output.append(f"\n... and {len(results) - 20} more results")
        
        return "\n".join(output)
    except Exception as e:
        return f"Query error: {str(e)}"


@tool
def get_graph_schema() -> str:
    """Get the schema of the knowledge graph - what node types and relationships exist.
    Useful for understanding what queries are possible."""
    
    node_counts = run_query(
        """
        CALL db.labels() YIELD label
        CALL apoc.cypher.run('MATCH (n:`' + label + '`) RETURN count(n) as count', {}) YIELD value
        RETURN label, value.count as count
        """
    )
    
    # Fallback if APOC not installed
    if not node_counts:
        node_counts = run_query(
            """
            MATCH (n)
            WITH labels(n) as labels
            UNWIND labels as label
            RETURN label, count(*) as count
            ORDER BY count DESC
            """
        )
    
    rel_counts = run_query(
        """
        MATCH ()-[r]->()
        RETURN type(r) as relationship, count(*) as count
        ORDER BY count DESC
        """
    )
    
    output = ["=== Knowledge Graph Schema ===\n", "Node Types:"]
    for r in node_counts:
        output.append(f"  - {r['label']}: {r['count']} nodes")
    
    output.append("\nRelationships:")
    for r in rel_counts:
        output.append(f"  - {r['relationship']}: {r['count']} edges")
    
    return "\n".join(output)


# Export all tools
ALL_TOOLS = [
    find_component,
    find_component_properties,
    find_property_usage,
    analyze_property_impact,
    find_controller,
    trace_component_to_actions,
    find_action_handlers,
    list_package_dependencies,
    run_cypher,
    get_graph_schema,
]
