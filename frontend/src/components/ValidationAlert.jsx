export default function ValidationAlert({ errors }) {
  if (!errors || Object.keys(errors).length === 0) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
      <h4 className="text-red-800 font-semibold mb-2">Validation Errors:</h4>
      <ul className="list-disc list-inside text-red-700">
        {Object.entries(errors).map(([field, message]) => (
          <li key={field}>{field}: {message}</li>
        ))}
      </ul>
    </div>
  );
}