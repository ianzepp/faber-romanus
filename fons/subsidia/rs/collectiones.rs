// collectiones.rs - Collection helper library for Rust target
//
// Provides helper functions for complex collection operations
// that are awkward to express as inline codegen templates.

use std::collections::{HashMap, HashSet};
use std::hash::Hash;

// =============================================================================
// TABULA (Map) HELPERS
// =============================================================================

/// Merge two maps, returning a new map (conflata)
pub fn tabula_conflata<K, V>(a: &HashMap<K, V>, b: &HashMap<K, V>) -> HashMap<K, V>
where
    K: Clone + Eq + Hash,
    V: Clone,
{
    let mut result = a.clone();
    result.extend(b.iter().map(|(k, v)| (k.clone(), v.clone())));
    result
}

/// Swap keys and values (inversa)
pub fn tabula_inversa<K, V>(map: &HashMap<K, V>) -> HashMap<V, K>
where
    K: Clone,
    V: Clone + Eq + Hash,
{
    map.iter().map(|(k, v)| (v.clone(), k.clone())).collect()
}

/// Keep only specified keys (selecta)
pub fn tabula_selecta<K, V>(map: &HashMap<K, V>, keys: &[K]) -> HashMap<K, V>
where
    K: Clone + Eq + Hash,
    V: Clone,
{
    let key_set: HashSet<_> = keys.iter().collect();
    map.iter()
        .filter(|(k, _)| key_set.contains(k))
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect()
}

/// Remove specified keys (omissa)
pub fn tabula_omissa<K, V>(map: &HashMap<K, V>, keys: &[K]) -> HashMap<K, V>
where
    K: Clone + Eq + Hash,
    V: Clone,
{
    let key_set: HashSet<_> = keys.iter().collect();
    map.iter()
        .filter(|(k, _)| !key_set.contains(k))
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect()
}

/// Convert to list of pairs (inLista)
pub fn tabula_in_lista<K, V>(map: &HashMap<K, V>) -> Vec<(K, V)>
where
    K: Clone,
    V: Clone,
{
    map.iter().map(|(k, v)| (k.clone(), v.clone())).collect()
}

// =============================================================================
// COPIA (Set) HELPERS
// =============================================================================

/// Union of two sets (unio)
pub fn copia_unio<T>(a: &HashSet<T>, b: &HashSet<T>) -> HashSet<T>
where
    T: Clone + Eq + Hash,
{
    a.union(b).cloned().collect()
}

/// Intersection of two sets (intersectio)
pub fn copia_intersectio<T>(a: &HashSet<T>, b: &HashSet<T>) -> HashSet<T>
where
    T: Clone + Eq + Hash,
{
    a.intersection(b).cloned().collect()
}

/// Difference of two sets (differentia)
pub fn copia_differentia<T>(a: &HashSet<T>, b: &HashSet<T>) -> HashSet<T>
where
    T: Clone + Eq + Hash,
{
    a.difference(b).cloned().collect()
}

/// Symmetric difference (symmetrica)
pub fn copia_symmetrica<T>(a: &HashSet<T>, b: &HashSet<T>) -> HashSet<T>
where
    T: Clone + Eq + Hash,
{
    a.symmetric_difference(b).cloned().collect()
}

/// Convert to list (inLista)
pub fn copia_in_lista<T>(set: &HashSet<T>) -> Vec<T>
where
    T: Clone,
{
    set.iter().cloned().collect()
}

// =============================================================================
// LISTA (Vec) HELPERS
// =============================================================================

/// Add to end, returning new list (addita)
pub fn lista_addita<T>(list: &[T], elem: T) -> Vec<T>
where
    T: Clone,
{
    let mut result = list.to_vec();
    result.push(elem);
    result
}

/// Add to start, returning new list (praeposita)
pub fn lista_praeposita<T>(list: &[T], elem: T) -> Vec<T>
where
    T: Clone,
{
    let mut result = vec![elem];
    result.extend(list.iter().cloned());
    result
}

/// Sort, returning new list (ordinata)
pub fn lista_ordinata<T>(list: &[T]) -> Vec<T>
where
    T: Clone + Ord,
{
    let mut result = list.to_vec();
    result.sort();
    result
}

/// Remove duplicates (unica)
pub fn lista_unica<T>(list: &[T]) -> Vec<T>
where
    T: Clone + Eq + Hash,
{
    let mut seen = HashSet::new();
    list.iter()
        .filter(|x| seen.insert((*x).clone()))
        .cloned()
        .collect()
}

/// Take last n elements (ultima)
pub fn lista_ultima<T>(list: &[T], n: usize) -> Vec<T>
where
    T: Clone,
{
    let start = list.len().saturating_sub(n);
    list[start..].to_vec()
}

/// Group by key function (congrega)
pub fn lista_congrega<T, K, F>(list: &[T], key_fn: F) -> HashMap<K, Vec<T>>
where
    T: Clone,
    K: Eq + Hash,
    F: Fn(&T) -> K,
{
    let mut result: HashMap<K, Vec<T>> = HashMap::new();
    for item in list {
        result.entry(key_fn(item)).or_default().push(item.clone());
    }
    result
}

/// Partition by predicate (partire)
pub fn lista_partire<T, F>(list: &[T], pred: F) -> (Vec<T>, Vec<T>)
where
    T: Clone,
    F: Fn(&T) -> bool,
{
    let mut truthy = Vec::new();
    let mut falsy = Vec::new();
    for item in list {
        if pred(item) {
            truthy.push(item.clone());
        }
        else {
            falsy.push(item.clone());
        }
    }
    (truthy, falsy)
}
