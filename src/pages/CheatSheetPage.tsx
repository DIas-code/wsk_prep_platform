import { useMemo, useState } from "react";

import { ShikiCode } from "../ui/ShikiCode";
import { PageContainer } from "../ui/AppShell";
import { BackLink, Badge, PageHeader } from "../ui/components";

type Section = {
  id: string;
  title: string;
  items: CheatItem[];
};

type CheatItem = {
  title: string;
  description: string;
  code: string;
  lang?: string;
};

const SECTIONS: Section[] = [
  {
    id: "project-setup",
    title: "Создание проекта",
    items: [
      {
        title: "Новый MAUI-проект (.NET 10)",
        description: "Создание нового проекта через CLI",
        code: `dotnet new maui -n MyApp -f net10.0
cd MyApp
dotnet build`,
      },
      {
        title: "NuGet: SQL Server ADO.NET",
        description: "Прямое подключение к MS SQL Server без ORM",
        code: `dotnet add package Microsoft.Data.SqlClient`,
      },
      {
        title: "NuGet: EF Core + SQL Server",
        description: "Entity Framework Core с провайдером SQL Server",
        code: `dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools`,
      },
      {
        title: "NuGet: MVVM Toolkit",
        description: "CommunityToolkit.Mvvm для ViewModel и команд",
        code: `dotnet add package CommunityToolkit.Mvvm`,
      },
    ],
  },
  {
    id: "connection",
    title: "Подключение к SQL Server",
    items: [
      {
        title: "Строка подключения (Preferences)",
        description: "Хранение строки подключения через Preferences (не хардкодить!)",
        code: `// Сохранить
Preferences.Default.Set("connection_string",
    "Server=.;Database=Session1;Trusted_Connection=True;TrustServerCertificate=True;");

// Прочитать
string connStr = Preferences.Default.Get("connection_string", string.Empty);`,
        lang: "csharp",
      },
      {
        title: "ADO.NET: выполнить SELECT",
        description: "Получить список записей через SqlCommand",
        code: `await using var conn = new SqlConnection(connStr);
await conn.OpenAsync();
await using var cmd = new SqlCommand(
    "SELECT Id, Name, DepartmentId FROM Assets WHERE DepartmentId = @deptId", conn);
cmd.Parameters.AddWithValue("@deptId", deptId);
await using var reader = await cmd.ExecuteReaderAsync();
while (await reader.ReadAsync())
{
    var asset = new Asset
    {
        Id = reader.GetInt32(0),
        Name = reader.GetString(1),
        DepartmentId = reader.GetInt32(2),
    };
    list.Add(asset);
}`,
        lang: "csharp",
      },
      {
        title: "ADO.NET: INSERT и вернуть новый ID",
        description: "Вставка записи с получением сгенерированного Id",
        code: `await using var conn = new SqlConnection(connStr);
await conn.OpenAsync();
await using var cmd = new SqlCommand(
    @"INSERT INTO Assets (Name, DepartmentId, GroupId)
      VALUES (@name, @deptId, @groupId);
      SELECT SCOPE_IDENTITY();", conn);
cmd.Parameters.AddWithValue("@name", asset.Name);
cmd.Parameters.AddWithValue("@deptId", asset.DepartmentId);
cmd.Parameters.AddWithValue("@groupId", asset.GroupId);
int newId = Convert.ToInt32(await cmd.ExecuteScalarAsync());`,
        lang: "csharp",
      },
      {
        title: "ADO.NET: UPDATE",
        description: "Обновление существующей записи",
        code: `await using var conn = new SqlConnection(connStr);
await conn.OpenAsync();
await using var cmd = new SqlCommand(
    "UPDATE Assets SET Name = @name, Description = @desc WHERE Id = @id", conn);
cmd.Parameters.AddWithValue("@name", asset.Name);
cmd.Parameters.AddWithValue("@desc", asset.Description);
cmd.Parameters.AddWithValue("@id", asset.Id);
await cmd.ExecuteNonQueryAsync();`,
        lang: "csharp",
      },
    ],
  },
  {
    id: "ef-core",
    title: "EF Core",
    items: [
      {
        title: "DbContext",
        description: "Настройка контекста для MAUI + SQL Server",
        code: `public class AppDbContext : DbContext
{
    private readonly string _connStr;
    public AppDbContext(string connStr) => _connStr = connStr;

    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<Department> Departments => Set<Department>();

    protected override void OnConfiguring(DbContextOptionsBuilder b)
        => b.UseSqlServer(_connStr);
}`,
        lang: "csharp",
      },
      {
        title: "Регистрация DbContext в DI (MauiProgram.cs)",
        description: "Подключение DbContext через DI-контейнер",
        code: `builder.Services.AddTransient<AppDbContext>(_ =>
    new AppDbContext(
        Preferences.Default.Get("connection_string", string.Empty)));`,
        lang: "csharp",
      },
      {
        title: "EF Core: SELECT с фильтром",
        description: "LINQ-запрос с условием и сортировкой",
        code: `var assets = await _db.Assets
    .Include(a => a.Department)
    .Where(a => a.DepartmentId == deptId)
    .OrderBy(a => a.Name)
    .ToListAsync();`,
        lang: "csharp",
      },
    ],
  },
  {
    id: "mvvm",
    title: "MVVM Toolkit",
    items: [
      {
        title: "ViewModel с ObservableProperty и RelayCommand",
        description: "Базовая ViewModel с автогенерацией свойств и команд",
        code: `[ObservableObject]
public partial class AssetsViewModel
{
    [ObservableProperty]
    private ObservableCollection<Asset> _assets = [];

    [ObservableProperty]
    private string _searchText = string.Empty;

    [ObservableProperty]
    private bool _isBusy;

    partial void OnSearchTextChanged(string value) => _ = LoadAsync();

    [RelayCommand]
    private async Task LoadAsync()
    {
        IsBusy = true;
        try { Assets = new ObservableCollection<Asset>(await _repo.GetAllAsync()); }
        finally { IsBusy = false; }
    }
}`,
        lang: "csharp",
      },
      {
        title: "Привязка ViewModel к ContentPage",
        description: "Установка BindingContext в XAML или code-behind",
        code: `<!-- XAML: -->
<ContentPage xmlns:vm="clr-namespace:MyApp.ViewModels"
             x:DataType="vm:AssetsViewModel">
    <ContentPage.BindingContext>
        <vm:AssetsViewModel />
    </ContentPage.BindingContext>
</ContentPage>`,
        lang: "xml",
      },
    ],
  },
  {
    id: "xaml",
    title: "XAML: ключевые контролы",
    items: [
      {
        title: "CollectionView со списком и пустым состоянием",
        description: "Список с EmptyView и привязкой команды при выборе",
        code: `<CollectionView ItemsSource="{Binding Assets}"
                SelectionMode="Single"
                SelectionChangedCommand="{Binding SelectAssetCommand}"
                SelectionChangedCommandParameter="{Binding SelectedItem, Source={RelativeSource Self}}">
    <CollectionView.EmptyView>
        <Label Text="Нет данных" HorizontalOptions="Center" />
    </CollectionView.EmptyView>
    <CollectionView.ItemTemplate>
        <DataTemplate x:DataType="model:Asset">
            <Grid Padding="12,8" ColumnDefinitions="*,Auto">
                <Label Text="{Binding Name}" FontAttributes="Bold" />
                <Label Grid.Column="1" Text="{Binding SerialNumber}"
                       TextColor="Gray" FontSize="12" />
            </Grid>
        </DataTemplate>
    </CollectionView.ItemTemplate>
</CollectionView>`,
        lang: "xml",
      },
      {
        title: "Picker (выпадающий список) с привязкой",
        description: "Picker с ItemsSource и SelectedItem",
        code: `<Picker Title="Департамент"
        ItemsSource="{Binding Departments}"
        ItemDisplayBinding="{Binding Name}"
        SelectedItem="{Binding SelectedDepartment}" />`,
        lang: "xml",
      },
      {
        title: "DatePicker",
        description: "Выбор даты с форматом ISO",
        code: `<DatePicker Date="{Binding WarrantyDate}"
            Format="yyyy-MM-dd"
            MinimumDate="2000-01-01" />`,
        lang: "xml",
      },
      {
        title: "SearchBar",
        description: "Поле поиска с командой",
        code: `<SearchBar Placeholder="Поиск по имени / SN..."
           Text="{Binding SearchText}"
           SearchCommand="{Binding SearchCommand}" />`,
        lang: "xml",
      },
      {
        title: "Grid-разметка",
        description: "Сетка с фиксированными и авто-размерами",
        code: `<Grid ColumnDefinitions="*,Auto,80"
      RowDefinitions="Auto,*,48"
      ColumnSpacing="8" RowSpacing="4">
    <Label Grid.Row="0" Grid.Column="0" Text="Заголовок" />
    <Button Grid.Row="2" Grid.ColumnSpan="3" Text="Сохранить" />
</Grid>`,
        lang: "xml",
      },
      {
        title: "Кнопки: деструктивные (красные)",
        description: "Delete и Cancel должны быть красными по Style Guide",
        code: `<Button Text="Удалить"
        BackgroundColor="Red"
        TextColor="White"
        Command="{Binding DeleteCommand}" />

<Button Text="Отмена"
        BackgroundColor="Red"
        TextColor="White"
        Command="{Binding CancelCommand}" />`,
        lang: "xml",
      },
    ],
  },
  {
    id: "navigation",
    title: "Shell-навигация",
    items: [
      {
        title: "Переход на страницу с параметром",
        description: "Shell.Current.GoToAsync с передачей объекта",
        code: `// Регистрация маршрута (MauiProgram.cs или AppShell.xaml.cs)
Routing.RegisterRoute("asset-detail", typeof(AssetDetailPage));

// Переход с параметром
await Shell.Current.GoToAsync("asset-detail", new Dictionary<string, object>
{
    ["Asset"] = selectedAsset
});`,
        lang: "csharp",
      },
      {
        title: "Получение параметра в целевой странице",
        description: "QueryProperty для приёма параметра навигации",
        code: `[QueryProperty(nameof(Asset), "Asset")]
public partial class AssetDetailPage : ContentPage
{
    public Asset? Asset { get; set; }
}`,
        lang: "csharp",
      },
      {
        title: "Назад",
        description: "Вернуться на предыдущую страницу",
        code: `await Shell.Current.GoToAsync("..");`,
        lang: "csharp",
      },
    ],
  },
  {
    id: "media",
    title: "Медиа: камера и галерея",
    items: [
      {
        title: "Разрешения (AndroidManifest / MAUI)",
        description: "Запрос разрешений на камеру и хранилище",
        code: `var status = await Permissions.RequestAsync<Permissions.Camera>();
if (status != PermissionStatus.Granted) return;`,
        lang: "csharp",
      },
      {
        title: "Сделать фото камерой",
        description: "MediaPicker.Default.CapturePhotoAsync",
        code: `var photo = await MediaPicker.Default.CapturePhotoAsync();
if (photo is null) return;
await using var stream = await photo.OpenReadAsync();
var bytes = new byte[stream.Length];
await stream.ReadAsync(bytes);`,
        lang: "csharp",
      },
      {
        title: "Выбрать фото из галереи",
        description: "MediaPicker.Default.PickPhotoAsync",
        code: `var photo = await MediaPicker.Default.PickPhotoAsync();
if (photo is null) return;
await using var stream = await photo.OpenReadAsync();
// использовать stream как ImageSource или byte[]`,
        lang: "csharp",
      },
    ],
  },
  {
    id: "sn-generation",
    title: "Генерация Serial Number (dd/gg/nnnn)",
    items: [
      {
        title: "Алгоритм генерации SN",
        description: "Формат: 2-значный DeptId / 2-значный GroupId / 4-значный счётчик",
        code: `// Запрос следующего счётчика из БД
await using var cmd = new SqlCommand(
    @"SELECT ISNULL(MAX(CAST(SUBSTRING(SerialNumber, 7, 4) AS INT)), 0) + 1
      FROM Assets
      WHERE DepartmentId = @deptId AND GroupId = @groupId", conn);
cmd.Parameters.AddWithValue("@deptId", deptId);
cmd.Parameters.AddWithValue("@groupId", groupId);
int counter = Convert.ToInt32(await cmd.ExecuteScalarAsync());

string sn = $"{deptId:D2}/{groupId:D2}/{counter:D4}";`,
        lang: "csharp",
      },
    ],
  },
  {
    id: "validation",
    title: "Валидация",
    items: [
      {
        title: "Проверка уникальности имени в локации",
        description: "Запрет дублирующихся имён активов в одной локации",
        code: `await using var cmd = new SqlCommand(
    @"SELECT COUNT(1) FROM Assets
      WHERE Name = @name AND LocationId = @locId AND Id <> @excludeId", conn);
cmd.Parameters.AddWithValue("@name", name);
cmd.Parameters.AddWithValue("@locId", locationId);
cmd.Parameters.AddWithValue("@excludeId", excludeId ?? (object)DBNull.Value);
int count = (int)await cmd.ExecuteScalarAsync();
if (count > 0)
    throw new InvalidOperationException("Актив с таким именем уже существует в этой локации.");`,
        lang: "csharp",
      },
      {
        title: "Обязательные поля перед Submit",
        description: "Проверка заполненности всех обязательных полей",
        code: `bool IsFormValid() =>
    !string.IsNullOrWhiteSpace(Name) &&
    SelectedDepartment is not null &&
    SelectedLocation is not null &&
    SelectedGroup is not null &&
    SelectedEmployee is not null;`,
        lang: "csharp",
      },
    ],
  },
  {
    id: "dates",
    title: "Работа с датами",
    items: [
      {
        title: "Форматирование даты в ISO (YYYY-MM-DD)",
        description: "Отображение и передача дат в нужном формате",
        code: `// Вывод
string display = date.ToString("yyyy-MM-dd");

// Парсинг из строки
DateTime parsed = DateTime.ParseExact(str, "yyyy-MM-dd", CultureInfo.InvariantCulture);

// В SQL (параметр — не строка)
cmd.Parameters.Add("@date", SqlDbType.Date).Value = date;`,
        lang: "csharp",
      },
      {
        title: "Проверка: переносов за последние 12 месяцев нет",
        description: "Фильтр истории — если нет, показать сообщение",
        code: `var cutoff = DateTime.Today.AddMonths(-12);
bool hasRecent = transfers.Any(t => t.TransferDate >= cutoff);
if (!hasRecent)
{
    await DisplayAlert("История", "Переносов за последние 12 месяцев не было.", "OK");
    await Shell.Current.GoToAsync("..");
    return;
}`,
        lang: "csharp",
      },
    ],
  },
  {
    id: "orientation",
    title: "Ориентация экрана",
    items: [
      {
        title: "Определить текущую ориентацию",
        description: "Landscape vs Portrait через DeviceDisplay",
        code: `bool isLandscape = DeviceDisplay.Current.MainDisplayInfo.Orientation
    == DisplayOrientation.Landscape;`,
        lang: "csharp",
      },
      {
        title: "Разные макеты через VisualStateManager",
        description: "Скрыть/показать элементы при смене ориентации",
        code: `<Grid>
    <VisualStateManager.VisualStateGroups>
        <VisualStateGroup Name="Orientation">
            <VisualState Name="Portrait">
                <VisualState.Setters>
                    <Setter TargetName="FilterPanel" Property="IsVisible" Value="True" />
                </VisualState.Setters>
            </VisualState>
            <VisualState Name="Landscape">
                <VisualState.Setters>
                    <Setter TargetName="FilterPanel" Property="IsVisible" Value="False" />
                </VisualState.Setters>
            </VisualState>
        </VisualStateGroup>
    </VisualStateManager.VisualStateGroups>
    <StackLayout x:Name="FilterPanel">...</StackLayout>
</Grid>`,
        lang: "xml",
      },
    ],
  },
];

export function CheatSheetPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      SECTIONS.map((sec) => ({
        ...sec,
        items: sec.items.filter(
          (item) =>
            !q ||
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.code.toLowerCase().includes(q),
        ),
      })).filter((sec) => sec.items.length > 0),
    [q],
  );

  const visibleSections = q
    ? filtered
    : activeSection
      ? filtered.filter((s) => s.id === activeSection)
      : filtered;

  const totalItems = SECTIONS.reduce((a, s) => a + s.items.length, 0);

  return (
    <PageContainer size="wide">
      <BackLink to="/">Все модули</BackLink>

      <PageHeader
        eyebrow="Cheat Sheet"
        title="C# · .NET MAUI"
        description={`${totalItems} рецептов и паттернов для WorldSkills Sessions 1–5. Поиск работает по названию, описанию и содержимому кода.`}
      />

      <div className="relative mb-8">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zm-7 5.5a7 7 0 1112.45 4.39l3.58 3.58a1 1 0 01-1.42 1.42l-3.58-3.58A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <input
          type="search"
          placeholder="Поиск по командам и коду…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm bg-white shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            aria-label="Очистить"
          >
            ×
          </button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
            Категории
          </div>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible scrollbar-thin">
            <button
              type="button"
              onClick={() => {
                setActiveSection(null);
                setSearch("");
              }}
              className={`shrink-0 text-left px-3 py-1.5 rounded-md text-sm transition focus-ring ${
                activeSection === null && !q
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Все ({SECTIONS.length})
            </button>
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setActiveSection(activeSection === sec.id ? null : sec.id);
                  setSearch("");
                }}
                className={`shrink-0 flex items-center justify-between gap-2 text-left px-3 py-1.5 rounded-md text-sm transition focus-ring ${
                  activeSection === sec.id
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="truncate">{sec.title}</span>
                <span className="text-xs text-slate-400 tabular-nums">
                  {sec.items.length}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-10 min-w-0">
          {visibleSections.length === 0 && (
            <div className="card p-8 text-center text-slate-500">
              По запросу{" "}
              <span className="font-medium text-slate-800">«{search}»</span> ничего не
              найдено.
            </div>
          )}
          {visibleSections.map((sec) => (
            <section key={sec.id}>
              <h2 className="section-title mb-4 flex items-center gap-2">
                {sec.title}
                <Badge tone="slate">{sec.items.length}</Badge>
              </h2>
              <div className="space-y-4">
                {sec.items.map((item, i) => (
                  <CheatCard key={i} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

function CheatCard({ item }: { item: CheatItem }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(item.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-semibold text-sm text-slate-900">{item.title}</div>
            {item.lang && <Badge tone="brand">{item.lang}</Badge>}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>
        </div>
        <button
          onClick={copy}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-ring transition"
        >
          {copied ? (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-emerald-600">
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 011.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
                  clipRule="evenodd"
                />
              </svg>
              Скопировано
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M8 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H8z" />
                <path d="M4 6a2 2 0 012-2v10a2 2 0 002 2h6a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              </svg>
              Копировать
            </>
          )}
        </button>
      </div>
      <div className="px-1 pb-1 pt-1">
        <ShikiCode code={item.code} language={item.lang ?? "csharp"} />
      </div>
    </div>
  );
}
