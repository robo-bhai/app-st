from django import forms
from .models import App, AppDemand

GLASS_INPUT_CLASS = (
    "w-full bg-[#18120e]/90 text-amber-50 placeholder-stone-500 text-xs sm:text-sm "
    "rounded-xl border border-amber-500/20 px-4 py-3 focus:outline-none "
    "focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all min-h-[44px]"
)

GLASS_SELECT_CLASS = (
    "w-full bg-[#18120e] text-amber-50 text-xs sm:text-sm rounded-xl border "
    "border-amber-500/20 px-4 py-3 focus:outline-none focus:border-amber-500 "
    "transition-all cursor-pointer min-h-[44px]"
)

class AppUploadForm(forms.ModelForm):
    """Admin form to publish or update an APK package with GitHub Release link & Cloudinary icon"""
    binary_link = forms.URLField(
        required=True,
        widget=forms.URLInput(attrs={
            'class': GLASS_INPUT_CLASS,
            'placeholder': 'https://github.com/owner/repo/releases/download/v1.0.0/app-release.apk'
        }),
        label="Binary Link (GitHub Release APK Direct URL)",
        help_text="Paste direct download URL from your GitHub Release"
    )

    icon_link = forms.URLField(
        required=False,
        widget=forms.URLInput(attrs={
            'class': GLASS_INPUT_CLASS,
            'placeholder': 'https://raw.githubusercontent.com/user/repo/main/.../icon.png'
        }),
        label="Icon Link (GitHub / Image URL)",
        help_text="Paste direct image link from GitHub (raw link) or external URL"
    )
    banner_link = forms.URLField(
        required=False,
        widget=forms.URLInput(attrs={
            'class': GLASS_INPUT_CLASS,
            'placeholder': 'https://raw.githubusercontent.com/user/repo/main/.../banner.png'
        }),
        label="Banner Link (GitHub / Image URL)",
        help_text="Paste direct banner link from GitHub (raw link) or external URL"
    )

    class Meta:
        model = App
        fields = [
            'app_name', 'package_name', 'developer_name', 'category',
            'version', 'file_size', 'rating', 'app_icon', 'icon_link', 'banner_image', 'banner_link',
            'binary_link', 'apk_file', 'description', 'is_featured', 'is_published'
        ]
        widgets = {
            'app_name': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'e.g., Aether Strike'}),
            'package_name': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'e.g., com.hadi88.aether'}),
            'developer_name': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'Hadi88 Studio'}),
            'category': forms.Select(attrs={'class': GLASS_SELECT_CLASS}),
            'version': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': '1.0.0'}),
            'file_size': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': '45 MB'}),
            'rating': forms.NumberInput(attrs={'class': GLASS_INPUT_CLASS, 'step': '0.1', 'min': '1.0', 'max': '5.0'}),
            'description': forms.Textarea(attrs={'class': GLASS_INPUT_CLASS, 'rows': 4}),
            'is_featured': forms.CheckboxInput(attrs={'class': 'w-5 h-5 accent-amber-500 rounded'}),
            'is_published': forms.CheckboxInput(attrs={'class': 'w-5 h-5 accent-amber-500 rounded'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'app_icon' in self.fields:
            self.fields['app_icon'].required = False
        if 'apk_file' in self.fields:
            self.fields['apk_file'].required = False
        if 'is_published' in self.fields and not self.instance.pk:
            self.fields['is_published'].initial = True


class AppDemandForm(forms.ModelForm):
    """
    Client On-Demand Form:
    "Find and ask for your dreaming apps"
    "We are building app on your demand"
    With mandatory legal compliance check.
    """
    legal_policy_agreed = forms.BooleanField(
        required=True,
        label="I confirm that my requested application is completely legal, non-infringing, and contains no theft, cracking, or illicit material."
    )

    class Meta:
        model = AppDemand
        fields = [
            'user_name', 'email', 'contact_method', 'contact_handle',
            'app_title', 'platform', 'category', 'requirements',
            'timeline', 'budget', 'legal_policy_agreed'
        ]
        widgets = {
            'user_name': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'Your Full Name'}),
            'email': forms.EmailInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'name@example.com'}),
            'contact_method': forms.Select(attrs={'class': GLASS_SELECT_CLASS}),
            'contact_handle': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'WhatsApp / Telegram / Phone'}),
            'app_title': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'Your Dreaming App Concept Name'}),
            'platform': forms.Select(attrs={'class': GLASS_SELECT_CLASS}),
            'category': forms.Select(attrs={'class': GLASS_SELECT_CLASS}),
            'requirements': forms.Textarea(attrs={
                'class': GLASS_INPUT_CLASS,
                'rows': 4,
                'placeholder': 'Explain your requirements: features, database needs, user authentication, third-party APIs...'
            }),
            'timeline': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'e.g. 2-4 Weeks'}),
            'budget': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'e.g. $1,000 - $3,000'}),
            'legal_policy_agreed': forms.CheckboxInput(attrs={'class': 'w-5 h-5 accent-amber-500 rounded mt-0.5'}),
        }
