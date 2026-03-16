<div align="left">
  
  [<< Contributing](/CONTRIBUTING.md)
  
</div>

<div align="right">
  
  [Table of content >>](table-of-content.md)
  
</div>

<div align="left">
  
  [< The docs folder](docs.md)
  
</div>

<div align="right">

  [The .github folder >](github-folder.md)
  
</div>

<hr>

<div align="center">

# raid-filters.json

</div>

This is the file that the user script uses to build the raid filters, besides the name one that is based on `raid-list.json`.  

> [!NOTE]
> Note that filter buttons were made to disallow values when unchecked, rather than allow them when checked (if that makes sense).

### Here is how one row of filters should look like:
```
{
    // ... Previous rows ...

    row_name: {
        button_name_1: {"filter_type":filter_type_1, "key":key_1, "value":value_1},
        button_name_2: {"filter_type":filter_type_2, "key":key_2, "value":value_2},
        button_name_3: {"filter_type":filter_type_3, "key":key_3, "value":value_3}
    },

    // ... Next rows ...
}

```
### Parameters:

* `row_name` is a character string, the text that you want to see being displayed in front of the buttons.
* `button_name_1`, `button_name_2`... are character strings, the text that you want inside the buttons.
* `filter_type_1`, `filter_type_2`... are character strings, with the following possible values, depending on the type of buttons that you want:  
    * `"checkbox"`
    * `"dropdown"`
* `key_1` is a character string with the following possible values: 
    * `"Difficulty"`
    * any key in `raid_list[name][mode]` that you want the button to affect, such as `"Raid size"`, `"Name"` or `"Raid type"`, <u>provided that the associated value is either a character string or an array of character strings</u>
* `value_1` can be either a character string or an array, with different meanings depending on the case:
    *  If the filter type is `"checkbox"`:
        * If `raid_list[name][mode][key_1]` is a character string, then <u>unchecking</u> the box will <u>disallow</u> raids if:
            * `raid_list[name][mode][key_1] == value1` (case where `value_1` is a string)
            * value of `raid_list[name][mode][key_1]` is included in `value_1` (case where `value_1` is an array <u>of character strings</u>)
        * If  `raid_list[name][mode][key_1]` is an array of character strings, then <u>checking</u> the box will <u>allow</u> raids if:
            * `raid_list[name][mode][key_1]` includes `value1` (case where `value_1` is a string)
            * `raid_list[name][mode][key_1]` is included has a common element with `value_1` (case where `value_1` is an array <u>of character strings</u>)
    * If the filter type is `"dropdown"`, then `value_1` **MUST** be an array:
        * The dropdown menu will create checkboxes following the same rules as above, one for each value in the array.
        * For this very reason, `value_1` will contain character strings, arrays of character strings **or a mix of both**.

<hr>

<div align="center">
  
  [< raid-list.json](raid-list-json.md) $~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~$ [The .github folder >](github-folder.md)
  
</div>