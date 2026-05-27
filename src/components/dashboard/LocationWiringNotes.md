# VulaTrade business location wiring notes

This branch adds the database fields and the first version of the BusinessLocationTab component.

Remaining app wiring needed in `src/pages/Dashboard.jsx`:

1. Add `MapPin` to the lucide-react import.
2. Import the screen:

```js
import { BusinessLocationTab } from "../components/dashboard/BusinessLocationTab";
```

3. Add a route:

```js
Location: "/location",
```

4. Add a desktop nav item under `Your Business`, after Setup:

```js
{ tab: "Location", label: "Location", icon: MapPin },
```

5. Add the same item to `MORE_ITEMS` for mobile.

6. Add a render case:

```jsx
case "Location":
  return <BusinessLocationTab business={business} setBusiness={setBusiness} />;
```

Public page area display is already supported through the existing `area` field. The Location tab saves both `area` and `location_label`, so saved locations will continue to appear on the public page as area text.

Testing flow:
- Open VulaTrade on mobile.
- Go to More > Location.
- Tap Use my current location.
- Allow browser location permission.
- Add a public area name.
- Save location.
- Confirm the public page shows the area, not the exact pin.
