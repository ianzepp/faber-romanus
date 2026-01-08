// collectiones.hpp - Collection helper library for C++ target
//
// Provides helper functions for complex collection operations
// that are awkward to express as inline codegen templates.

#pragma once

#include <algorithm>
#include <functional>
#include <random>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace faber {

// =============================================================================
// TABULA (Map) HELPERS
// =============================================================================

/// Merge two maps, returning a new map (conflata)
template <typename K, typename V>
std::unordered_map<K, V> tabula_conflata(
    const std::unordered_map<K, V>& a,
    const std::unordered_map<K, V>& b
) {
    auto result = a;
    for (const auto& [k, v] : b) {
        result[k] = v;
    }
    return result;
}

/// Swap keys and values (inversa)
template <typename K, typename V>
std::unordered_map<V, K> tabula_inversa(const std::unordered_map<K, V>& map) {
    std::unordered_map<V, K> result;
    for (const auto& [k, v] : map) {
        result[v] = k;
    }
    return result;
}

/// Keep only specified keys (selecta)
template <typename K, typename V>
std::unordered_map<K, V> tabula_selecta(
    const std::unordered_map<K, V>& map,
    const std::vector<K>& keys
) {
    std::unordered_set<K> key_set(keys.begin(), keys.end());
    std::unordered_map<K, V> result;
    for (const auto& [k, v] : map) {
        if (key_set.contains(k)) {
            result[k] = v;
        }
    }
    return result;
}

/// Remove specified keys (omissa)
template <typename K, typename V>
std::unordered_map<K, V> tabula_omissa(
    const std::unordered_map<K, V>& map,
    const std::vector<K>& keys
) {
    std::unordered_set<K> key_set(keys.begin(), keys.end());
    std::unordered_map<K, V> result;
    for (const auto& [k, v] : map) {
        if (!key_set.contains(k)) {
            result[k] = v;
        }
    }
    return result;
}

/// Convert to list of pairs (inLista)
template <typename K, typename V>
std::vector<std::pair<K, V>> tabula_in_lista(const std::unordered_map<K, V>& map) {
    return std::vector<std::pair<K, V>>(map.begin(), map.end());
}

// =============================================================================
// COPIA (Set) HELPERS
// =============================================================================

/// Union of two sets (unio)
template <typename T>
std::unordered_set<T> copia_unio(
    const std::unordered_set<T>& a,
    const std::unordered_set<T>& b
) {
    auto result = a;
    result.insert(b.begin(), b.end());
    return result;
}

/// Intersection of two sets (intersectio)
template <typename T>
std::unordered_set<T> copia_intersectio(
    const std::unordered_set<T>& a,
    const std::unordered_set<T>& b
) {
    std::unordered_set<T> result;
    for (const auto& x : a) {
        if (b.contains(x)) {
            result.insert(x);
        }
    }
    return result;
}

/// Difference of two sets (differentia)
template <typename T>
std::unordered_set<T> copia_differentia(
    const std::unordered_set<T>& a,
    const std::unordered_set<T>& b
) {
    std::unordered_set<T> result;
    for (const auto& x : a) {
        if (!b.contains(x)) {
            result.insert(x);
        }
    }
    return result;
}

/// Symmetric difference (symmetrica)
template <typename T>
std::unordered_set<T> copia_symmetrica(
    const std::unordered_set<T>& a,
    const std::unordered_set<T>& b
) {
    std::unordered_set<T> result;
    for (const auto& x : a) {
        if (!b.contains(x)) result.insert(x);
    }
    for (const auto& x : b) {
        if (!a.contains(x)) result.insert(x);
    }
    return result;
}

/// Check if subset (subcopia)
template <typename T>
bool copia_subcopia(
    const std::unordered_set<T>& a,
    const std::unordered_set<T>& b
) {
    for (const auto& x : a) {
        if (!b.contains(x)) return false;
    }
    return true;
}

/// Check if superset (supercopia)
template <typename T>
bool copia_supercopia(
    const std::unordered_set<T>& a,
    const std::unordered_set<T>& b
) {
    return copia_subcopia(b, a);
}

/// Convert to list (inLista)
template <typename T>
std::vector<T> copia_in_lista(const std::unordered_set<T>& set) {
    return std::vector<T>(set.begin(), set.end());
}

// =============================================================================
// LISTA (Vector) HELPERS
// =============================================================================

/// Add to end, returning new list (addita)
template <typename T>
std::vector<T> lista_addita(const std::vector<T>& list, const T& elem) {
    auto result = list;
    result.push_back(elem);
    return result;
}

/// Add to start, returning new list (praeposita)
template <typename T>
std::vector<T> lista_praeposita(const std::vector<T>& list, const T& elem) {
    std::vector<T> result;
    result.reserve(list.size() + 1);
    result.push_back(elem);
    result.insert(result.end(), list.begin(), list.end());
    return result;
}

/// Remove and return last element (remove - the pop operation)
template <typename T>
T lista_remove(std::vector<T>& list) {
    auto v = list.back();
    list.pop_back();
    return v;
}

/// Remove and return first element (decapita)
template <typename T>
T lista_decapita(std::vector<T>& list) {
    auto v = list.front();
    list.erase(list.begin());
    return v;
}

/// Find index of element (indiceDe)
template <typename T>
int64_t lista_indice_de(const std::vector<T>& list, const T& elem) {
    auto it = std::find(list.begin(), list.end(), elem);
    return it != list.end() ? std::distance(list.begin(), it) : -1;
}

/// Find index matching predicate (inveniIndicem)
template <typename T, typename Pred>
int64_t lista_inveni_indicem(const std::vector<T>& list, Pred pred) {
    auto it = std::find_if(list.begin(), list.end(), pred);
    return it != list.end() ? std::distance(list.begin(), it) : -1;
}

/// Sort, returning new list (ordinata)
template <typename T>
std::vector<T> lista_ordinata(const std::vector<T>& list) {
    auto result = list;
    std::ranges::sort(result);
    return result;
}

/// Reverse, returning new list (inversa)
template <typename T>
std::vector<T> lista_inversa(const std::vector<T>& list) {
    std::vector<T> result(list.rbegin(), list.rend());
    return result;
}

/// Remove duplicates (unica)
template <typename T>
std::vector<T> lista_unica(const std::vector<T>& list) {
    std::unordered_set<T> seen;
    std::vector<T> result;
    for (const auto& x : list) {
        if (seen.insert(x).second) {
            result.push_back(x);
        }
    }
    return result;
}

/// Take last n elements (ultima)
template <typename T>
std::vector<T> lista_ultima(const std::vector<T>& list, size_t n) {
    if (n >= list.size()) return list;
    return std::vector<T>(list.end() - n, list.end());
}

/// Join elements to string (coniunge)
template <typename T>
std::string lista_coniunge(const std::vector<T>& list, const std::string& sep) {
    std::string result;
    for (size_t i = 0; i < list.size(); ++i) {
        if (i > 0) result += sep;
        if constexpr (std::is_same_v<T, std::string>) {
            result += list[i];
        }
        else {
            result += std::to_string(list[i]);
        }
    }
    return result;
}

/// Group by key function (congrega)
template <typename T, typename K, typename KeyFn>
std::unordered_map<K, std::vector<T>> lista_congrega(
    const std::vector<T>& list,
    KeyFn key_fn
) {
    std::unordered_map<K, std::vector<T>> result;
    for (const auto& x : list) {
        result[key_fn(x)].push_back(x);
    }
    return result;
}

/// Partition by predicate (partire)
template <typename T, typename Pred>
std::pair<std::vector<T>, std::vector<T>> lista_partire(
    const std::vector<T>& list,
    Pred pred
) {
    std::vector<T> truthy, falsy;
    for (const auto& x : list) {
        (pred(x) ? truthy : falsy).push_back(x);
    }
    return {truthy, falsy};
}

/// Shuffle, returning new list (miscita)
template <typename T>
std::vector<T> lista_miscita(const std::vector<T>& list) {
    auto result = list;
    std::random_device rd;
    std::mt19937 g(rd());
    std::ranges::shuffle(result, g);
    return result;
}

/// Random element (specimen)
template <typename T>
const T& lista_specimen(const std::vector<T>& list) {
    return list[std::random_device{}() % list.size()];
}

/// Random n elements (specimina)
template <typename T>
std::vector<T> lista_specimina(const std::vector<T>& list, size_t n) {
    auto result = lista_miscita(list);
    result.resize(std::min(n, result.size()));
    return result;
}

/// Split into chunks (fragmenta)
template <typename T>
std::vector<std::vector<T>> lista_fragmenta(const std::vector<T>& list, size_t n) {
    std::vector<std::vector<T>> result;
    for (size_t i = 0; i < list.size(); i += n) {
        result.emplace_back(
            list.begin() + i,
            list.begin() + std::min(i + n, list.size())
        );
    }
    return result;
}

} // namespace faber
