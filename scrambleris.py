import pandas as pd
import random
from datetime import datetime

def group_words_from_excel(excel_file, sheet_name='Sheet1', word_column='Words', group_size=8):
    """
    Reads words from an Excel file, scrambles them, and creates groups of specified size.
    
    Parameters:
    excel_file (str): Path to the Excel file
    sheet_name (str): Name of the sheet containing the words
    word_column (str): Name of the column containing the words
    group_size (int): Number of words per group
    
    Returns:
    list: List of word groups, where each group is a list of words
    """
    try:
        # Read the Excel file
        df = pd.read_excel(excel_file, sheet_name=sheet_name)
        
        # Extract words from the specified column
        words = df[word_column].dropna().tolist()
        
        # Convert all words to strings and strip whitespace
        words = [str(word).strip() for word in words]
        
        # Remove any empty strings
        words = [word for word in words if word]
        
        # Shuffle the words
        random.shuffle(words)
        
        # Create groups
        groups = []
        for i in range(0, len(words), group_size):
            group = words[i:i + group_size]
            # If it's the last group and not complete, fill with None
            if len(group) < group_size:
                group.extend([None] * (group_size - len(group)))
            groups.append(group)
        
        return groups
    
    except FileNotFoundError:
        print(f"Error: File '{excel_file}' not found.")
        return None
    except KeyError:
        print(f"Error: Column '{word_column}' not found in the Excel file.")
        return None
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return None

def save_groups_to_excel(groups, output_file=None):
    """
    Saves the word groups to a new Excel file.
    
    Parameters:
    groups (list): List of word groups
    output_file (str): Name of the output Excel file. If None, generates a timestamped name
    """
    if not output_file:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"word_groups_{timestamp}.xlsx"
    
    try:
        # Create a DataFrame with numbered columns for each word in a group
        df_data = []
        for group_num, group in enumerate(groups, 1):
            row_data = {'Group': f'Group {group_num}'}
            for i, word in enumerate(group, 1):
                if word is not None:  # Only add non-None words
                    row_data[f'Word {i}'] = word
            df_data.append(row_data)
        
        # Create DataFrame and save to Excel
        df = pd.DataFrame(df_data)
        df.to_excel(output_file, index=False)
        print(f"\nGroups have been saved to: {output_file}")
        return True
        
    except Exception as e:
        print(f"Error saving to Excel: {str(e)}")
        return False

# Example usage
if __name__ == "__main__":
    # Example of how to use the function
    input_file = "words.xlsx"  # Replace with your Excel file path
    groups = group_words_from_excel(input_file)
    
    if groups:
        print("Word Groups:")
        for i, group in enumerate(groups, 1):
            # Filter out None values for the last group
            group = [word for word in group if word is not None]
            print(f"\nGroup {i}:")
            print(", ".join(group))
        
        # Save groups to a new Excel file
        save_groups_to_excel(groups)